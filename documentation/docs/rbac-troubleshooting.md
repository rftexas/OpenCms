# RBAC Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues with the multi-tenant role-based access control system in OpenCMS.

## Common Issues

### 1. User Cannot Login

#### Symptoms
- Login fails with "Invalid email or password"
- User exists in database but cannot authenticate

#### Diagnosis Steps

**Check User Exists:**
```sql
SELECT user_id, email, first_name, last_name 
FROM "user" 
WHERE email = 'problematic-user@example.com';
```

**Check User Credential:**
```sql
SELECT uc.user_id, uc.created_at, uc.updated_at
FROM user_credential uc
JOIN "user" u ON uc.user_id = u.user_id
WHERE u.email = 'problematic-user@example.com';
```

**Check Role Assignments:**
```sql
SELECT u.email, t.name as tenant_name, r.name as role_name, ut.assigned_at
FROM "user" u
JOIN user_tenant ut ON u.user_id = ut.user_id
JOIN tenant t ON ut.tenant_id = t.tenant_id
JOIN role r ON ut.role_id = r.role_id
WHERE u.email = 'problematic-user@example.com';
```

#### Solutions

**Missing Credentials:**
```sql
-- If user exists but has no credentials, they need to reset password
INSERT INTO password_reset_token (user_id, token, expires_at)
VALUES (
    (SELECT user_id FROM "user" WHERE email = 'user@example.com'),
    'manual-reset-token-123',
    NOW() + INTERVAL '24 hours'
);
```

**No Role Assignments:**
```sql
-- Assign default role to user
INSERT INTO user_tenant (user_id, tenant_id, role_id)
VALUES (
    (SELECT user_id FROM "user" WHERE email = 'user@example.com'),
    (SELECT tenant_id FROM tenant WHERE name = 'Default Organization'),
    (SELECT role_id FROM role WHERE name = 'Reporter')
);
```

**Password Issues:**
- Check if password hashing is working correctly
- Verify salt and hash iterations
- Test with a known good password

### 2. Access Denied Errors

#### Symptoms
- User can login but gets "Access Denied" on certain pages
- API returns 403 Forbidden
- Frontend shows "Unauthorized" component

#### Diagnosis Steps

**Check JWT Token Claims:**
```typescript
// In browser console
const token = localStorage.getItem('token');
if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT Claims:', payload);
}
```

**Check Frontend Role Logic:**
```typescript
// In React DevTools or console
const user = store.getState().auth.user;
console.log('User object:', user);
console.log('Is Super User:', isSuperUser(user));
console.log('Is Administrator:', isAdministrator(user));
```

**Check API Authorization:**
```csharp
// Add logging to your controller
[HttpGet]
public async Task<IActionResult> ProtectedEndpoint()
{
    var user = await GetCurrentUserWithTenants();
    _logger.LogInformation("User {Email} accessing endpoint with roles: {Roles}", 
        user.Email.Value, 
        string.Join(", ", user.UserTenants.Select(ut => ut.Role?.Name)));
    
    // Your authorization logic here
}
```

#### Solutions

**Frontend Role Mismatch:**
```typescript
// Update role checking to use exact role names
const isSuperUser = (user: User | null): boolean => {
    return user?.primaryRole === 'Super User'; // Note: exact case
};
```

**Missing Role in Token:**
```csharp
// Ensure JWT includes all necessary claims
var claims = new List<Claim>
{
    new Claim("userId", user.UserId.Value.ToString()),
    new Claim("email", user.Email.Value),
    new Claim("primaryRole", user.GetPrimaryRoleName()),
    // Add tenant-specific claims
    ...user.UserTenants.Select(ut => new Claim("role", ut.Role?.Name ?? "")),
    ...user.UserTenants.Select(ut => new Claim("tenant", ut.TenantId.Value.ToString()))
};
```

**Database Role Issues:**
```sql
-- Check if role names match exactly
SELECT DISTINCT name FROM role ORDER BY name;

-- Update role names if needed
UPDATE role SET name = 'Super User' WHERE name = 'superuser';
```

### 3. Multi-Tenant Data Leakage

#### Symptoms
- User sees data from tenants they don't belong to
- API returns data from wrong tenant
- Cross-tenant information exposure

#### Diagnosis Steps

**Check User's Tenant Access:**
```sql
-- Get all tenants user has access to
SELECT t.tenant_id, t.name, r.name as role_name
FROM tenant t
JOIN user_tenant ut ON t.tenant_id = ut.tenant_id
JOIN role r ON ut.role_id = r.role_id
JOIN "user" u ON ut.user_id = u.user_id
WHERE u.email = 'user@example.com';
```

**Check API Queries:**
```csharp
// Ensure queries include tenant filtering
var cases = await _context.Cases
    .Where(c => userTenantIds.Contains(c.TenantId)) // Important!
    .ToListAsync();
```

#### Solutions

**Add Tenant Filtering:**
```csharp
public async Task<IEnumerable<Case>> GetCasesForUserAsync(UserId userId)
{
    var user = await _userRepository.GetByIdWithTenantsAsync(userId);
    var accessibleTenantIds = user.UserTenants.Select(ut => ut.TenantId).ToList();
    
    return await _context.Cases
        .Where(c => accessibleTenantIds.Contains(c.TenantId) || user.IsSuperUser())
        .ToListAsync();
}
```

**Implement Repository Pattern:**
```csharp
public interface ITenantAwareRepository<T>
{
    Task<IEnumerable<T>> GetForTenantsAsync(IEnumerable<TenantId> tenantIds);
}
```

### 4. Performance Issues

#### Symptoms
- Slow login times
- API requests timing out
- Frontend lag when checking permissions

#### Diagnosis Steps

**Check Query Performance:**
```sql
-- Analyze login query performance
EXPLAIN ANALYZE
SELECT u.*, ut.*, t.*, r.*
FROM "user" u
LEFT JOIN user_tenant ut ON u.user_id = ut.user_id
LEFT JOIN tenant t ON ut.tenant_id = t.tenant_id
LEFT JOIN role r ON ut.role_id = r.role_id
WHERE u.email = 'test@example.com';
```

**Check Frontend Performance:**
```typescript
// Add performance monitoring
console.time('roleCheck');
const hasPermission = isSuperUser(user);
console.timeEnd('roleCheck');
```

#### Solutions

**Add Database Indexes:**
```sql
-- Essential indexes for RBAC
CREATE INDEX CONCURRENTLY idx_user_email ON "user"(email);
CREATE INDEX CONCURRENTLY idx_user_tenant_user_id ON user_tenant(user_id);
CREATE INDEX CONCURRENTLY idx_user_tenant_composite ON user_tenant(user_id, tenant_id, role_id);
```

**Optimize Frontend Selectors:**
```typescript
// Use memoized selectors
export const selectUserPermissions = createSelector(
    [selectCurrentUser],
    (user) => ({
        isSuperUser: isSuperUser(user),
        isAdmin: isAdministrator(user),
        tenants: user?.tenants || []
    })
);
```

**Cache User Permissions:**
```csharp
public class CachedUserService
{
    private readonly IMemoryCache _cache;
    
    public async Task<User> GetUserWithCachedPermissionsAsync(UserId userId)
    {
        var cacheKey = $"user_permissions_{userId}";
        
        if (_cache.TryGetValue(cacheKey, out User cachedUser))
        {
            return cachedUser;
        }
        
        var user = await _userRepository.GetByIdWithTenantsAsync(userId);
        _cache.Set(cacheKey, user, TimeSpan.FromMinutes(5));
        
        return user;
    }
}
```

### 5. JWT Token Issues

#### Symptoms
- Token validation failures
- "Invalid token" errors
- Inconsistent authentication state

#### Diagnosis Steps

**Inspect Token:**
```javascript
// Decode JWT token (client-side debugging only)
function decodeJWT(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Expires at:', new Date(payload.exp * 1000));
        console.log('Issued at:', new Date(payload.iat * 1000));
        return payload;
    } catch (error) {
        console.error('Invalid token format:', error);
        return null;
    }
}

const token = localStorage.getItem('token');
decodeJWT(token);
```

**Check Token Configuration:**
```csharp
// Verify JWT configuration
var jwtSecret = _configuration["Jwt:Secret"];
var jwtIssuer = _configuration["Jwt:Issuer"];
var jwtAudience = _configuration["Jwt:Audience"];

Console.WriteLine($"JWT Secret length: {jwtSecret?.Length}");
Console.WriteLine($"JWT Issuer: {jwtIssuer}");
Console.WriteLine($"JWT Audience: {jwtAudience}");
```

#### Solutions

**Fix Token Expiration:**
```csharp
var tokenDescriptor = new SecurityTokenDescriptor
{
    Subject = new ClaimsIdentity(claims),
    Expires = DateTime.UtcNow.AddMinutes(30), // Reasonable expiration
    SigningCredentials = new SigningCredentials(
        new SymmetricSecurityKey(key),
        SecurityAlgorithms.HmacSha256Signature)
};
```

**Handle Token Refresh:**
```typescript
// Add token refresh logic
export const refreshTokenIfNeeded = createAsyncThunk(
    'auth/refreshToken',
    async (_, { getState, dispatch }) => {
        const { auth } = getState() as RootState;
        const token = auth.token;
        
        if (token && isTokenExpiringSoon(token)) {
            // Implement token refresh logic
            const newToken = await refreshToken(token);
            dispatch(setCredentials({ token: newToken }));
        }
    }
);
```

### 6. Role Assignment Issues

#### Symptoms
- Users not getting expected roles
- Role changes not taking effect
- Incorrect role hierarchy

#### Diagnosis Steps

**Check Role Data:**
```sql
-- Verify role definitions
SELECT role_id, name, description, sort_order 
FROM role 
ORDER BY sort_order;

-- Check for duplicate or inconsistent role names
SELECT name, COUNT(*) 
FROM role 
GROUP BY name 
HAVING COUNT(*) > 1;
```

**Check Role Assignments:**
```sql
-- Check specific user's roles
SELECT 
    u.email,
    t.name as tenant_name,
    r.name as role_name,
    r.sort_order,
    ut.assigned_at
FROM "user" u
JOIN user_tenant ut ON u.user_id = ut.user_id
JOIN tenant t ON ut.tenant_id = t.tenant_id
JOIN role r ON ut.role_id = r.role_id
WHERE u.email = 'user@example.com'
ORDER BY r.sort_order;
```

#### Solutions

**Fix Role Names:**
```sql
-- Standardize role names
UPDATE role SET name = 'Super User' WHERE name IN ('superuser', 'super_user', 'SuperUser');
UPDATE role SET name = 'Administrator' WHERE name IN ('admin', 'administrator', 'Admin');
```

**Correct Role Assignments:**
```sql
-- Remove duplicate role assignments
DELETE FROM user_tenant ut1
WHERE EXISTS (
    SELECT 1 FROM user_tenant ut2
    WHERE ut2.user_id = ut1.user_id 
    AND ut2.tenant_id = ut1.tenant_id
    AND ut2.assigned_at > ut1.assigned_at
);
```

**Update Primary Role Logic:**
```csharp
public string GetPrimaryRoleName()
{
    if (!UserTenants.Any()) return "No Role";
    
    // Return highest priority role (lowest sort_order)
    return UserTenants
        .Where(ut => ut.Role != null)
        .OrderBy(ut => ut.Role.SortOrder)
        .First()
        .Role.Name;
}
```

## Debugging Tools

### 1. Database Queries

**User Permission Summary:**
```sql
CREATE OR REPLACE VIEW user_permission_summary AS
SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(ut.tenant_id) as tenant_count,
    STRING_AGG(DISTINCT r.name, ', ') as roles,
    STRING_AGG(DISTINCT t.name, ', ') as tenants,
    MIN(r.sort_order) as highest_role_priority
FROM "user" u
LEFT JOIN user_tenant ut ON u.user_id = ut.user_id
LEFT JOIN tenant t ON ut.tenant_id = t.tenant_id
LEFT JOIN role r ON ut.role_id = r.role_id
GROUP BY u.user_id, u.email, u.first_name, u.last_name;

-- Usage
SELECT * FROM user_permission_summary WHERE email = 'user@example.com';
```

**Tenant Access Matrix:**
```sql
CREATE OR REPLACE VIEW tenant_access_matrix AS
SELECT 
    t.name as tenant_name,
    r.name as role_name,
    COUNT(ut.user_id) as user_count,
    STRING_AGG(u.email, ', ') as users
FROM tenant t
CROSS JOIN role r
LEFT JOIN user_tenant ut ON t.tenant_id = ut.tenant_id AND r.role_id = ut.role_id
LEFT JOIN "user" u ON ut.user_id = u.user_id
GROUP BY t.tenant_id, t.name, r.role_id, r.name, r.sort_order
ORDER BY t.name, r.sort_order;
```

### 2. Frontend Debug Components

**Permission Debug Component:**
```typescript
export const PermissionDebugger: React.FC = () => {
    const user = useSelector(selectCurrentUser);
    const permissions = useUserPermissions();
    
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }
    
    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            fontSize: '12px',
            maxWidth: '300px'
        }}>
            <h4>Permission Debug</h4>
            <pre>{JSON.stringify({
                user: {
                    email: user?.email,
                    primaryRole: user?.primaryRole,
                    tenants: user?.tenants
                },
                permissions: {
                    isSuperUser: permissions.isSuperUser,
                    isAdministrator: permissions.isAdministrator,
                    accessibleTenants: permissions.getAccessibleTenants()
                }
            }, null, 2)}</pre>
        </div>
    );
};
```

### 3. API Debug Endpoints

**Debug Controller (Development Only):**
```csharp
[ApiController]
[Route("api/debug")]
[Conditional("DEBUG")]
public class DebugController : ControllerBase
{
    [HttpGet("user-permissions/{email}")]
    public async Task<IActionResult> GetUserPermissions(string email)
    {
        var user = await _userRepository.GetByEmailWithTenants(Email.From(email));
        
        if (user == null)
            return NotFound();
            
        return Ok(new
        {
            UserId = user.UserId.Value,
            Email = user.Email.Value,
            PrimaryRole = user.GetPrimaryRoleName(),
            IsSuperUser = user.IsSuperUser(),
            IsAdministrator = user.IsAdministrator(),
            Tenants = user.UserTenants.Select(ut => new
            {
                TenantId = ut.TenantId.Value,
                TenantName = ut.Tenant?.Name,
                RoleName = ut.Role?.Name,
                AssignedAt = ut.AssignedAt
            })
        });
    }
}
```

## Log Analysis

### 1. Application Logs

**Authentication Logs:**
```csharp
_logger.LogInformation("User {Email} login attempt", loginRequest.Email);
_logger.LogInformation("User {Email} login successful with {RoleCount} roles", 
    user.Email.Value, user.UserTenants.Count);
_logger.LogWarning("User {Email} login failed - invalid credentials", loginRequest.Email);
```

**Authorization Logs:**
```csharp
_logger.LogInformation("User {Email} accessing {Endpoint} with role {Role}", 
    user.Email.Value, Request.Path, user.GetPrimaryRoleName());
_logger.LogWarning("User {Email} denied access to {Endpoint} - insufficient permissions", 
    user.Email.Value, Request.Path);
```

### 2. Database Logs

**Enable Query Logging:**
```csharp
// In appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

### 3. Frontend Logs

**Redux Logger:**
```typescript
// Add redux-logger in development
const store = configureStore({
    reducer: {
        auth: authSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            process.env.NODE_ENV === 'development' ? [logger] : []
        )
});
```

## Recovery Procedures

### 1. Emergency Super User Access

```sql
-- Create emergency super user
DO $$
DECLARE
    emergency_user_id UUID;
    default_tenant_id UUID;
    super_user_role_id UUID;
BEGIN
    -- Get or create emergency user
    INSERT INTO "user" (email, first_name, last_name)
    VALUES ('emergency@yourdomain.com', 'Emergency', 'Admin')
    ON CONFLICT (email) DO NOTHING
    RETURNING user_id INTO emergency_user_id;
    
    -- If user already existed, get the ID
    IF emergency_user_id IS NULL THEN
        SELECT user_id INTO emergency_user_id
        FROM "user" WHERE email = 'emergency@yourdomain.com';
    END IF;
    
    -- Get default tenant and super user role
    SELECT tenant_id INTO default_tenant_id
    FROM tenant WHERE name = 'Default Organization' LIMIT 1;
    
    SELECT role_id INTO super_user_role_id
    FROM role WHERE name = 'Super User' LIMIT 1;
    
    -- Assign super user role
    INSERT INTO user_tenant (user_id, tenant_id, role_id)
    VALUES (emergency_user_id, default_tenant_id, super_user_role_id)
    ON CONFLICT (user_id, tenant_id) DO UPDATE SET
        role_id = super_user_role_id;
        
    -- Create temporary password (user will need to reset)
    INSERT INTO password_reset_token (user_id, token, expires_at)
    VALUES (emergency_user_id, 'EMERGENCY_RESET_TOKEN', NOW() + INTERVAL '1 day')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Emergency user created: emergency@yourdomain.com';
    RAISE NOTICE 'Password reset token: EMERGENCY_RESET_TOKEN';
END $$;
```

### 2. Reset All User Permissions

```sql
-- DANGER: This removes all role assignments
-- Only use in emergency situations
TRUNCATE user_tenant CASCADE;

-- Reassign default roles
INSERT INTO user_tenant (user_id, tenant_id, role_id)
SELECT 
    u.user_id,
    (SELECT tenant_id FROM tenant WHERE name = 'Default Organization'),
    (SELECT role_id FROM role WHERE name = 'Reporter')
FROM "user" u;
```

### 3. Database Corruption Recovery

```sql
-- Check for orphaned records
SELECT 'Orphaned user_tenant records' as issue, COUNT(*)
FROM user_tenant ut
LEFT JOIN "user" u ON ut.user_id = u.user_id
WHERE u.user_id IS NULL;

-- Clean up orphaned records
DELETE FROM user_tenant ut
WHERE NOT EXISTS (
    SELECT 1 FROM "user" u WHERE u.user_id = ut.user_id
);

DELETE FROM user_tenant ut
WHERE NOT EXISTS (
    SELECT 1 FROM tenant t WHERE t.tenant_id = ut.tenant_id
);

DELETE FROM user_tenant ut
WHERE NOT EXISTS (
    SELECT 1 FROM role r WHERE r.role_id = ut.role_id
);
```

## Prevention Strategies

### 1. Health Checks

**API Health Check:**
```csharp
public class RbacHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check essential roles exist
            var roleCount = await _context.Roles.CountAsync();
            if (roleCount < 5) // Expected: Super User, Admin, Investigator, Reviewer, Reporter
            {
                return HealthCheckResult.Degraded("Missing essential roles");
            }
            
            // Check for users without roles
            var usersWithoutRoles = await _context.Users
                .Where(u => !u.UserTenants.Any())
                .CountAsync();
                
            if (usersWithoutRoles > 0)
            {
                return HealthCheckResult.Degraded($"{usersWithoutRoles} users have no role assignments");
            }
            
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("RBAC system check failed", ex);
        }
    }
}
```

### 2. Automated Tests

**Integration Test:**
```csharp
[Test]
public async Task RbacSystem_EndToEnd_WorksCorrectly()
{
    // Create test data
    var tenant = await CreateTenantAsync("Test Tenant");
    var user = await CreateUserAsync("test@example.com");
    var adminRole = await GetRoleAsync("Administrator");
    
    // Assign role
    await AssignUserToTenantAsync(user.UserId, tenant.TenantId, adminRole.RoleId);
    
    // Test login
    var loginResponse = await LoginAsync("test@example.com", "password");
    Assert.IsNotNull(loginResponse.Token);
    
    // Test authorization
    var hasAccess = await CheckTenantAccessAsync(user.UserId, tenant.TenantId);
    Assert.IsTrue(hasAccess);
}
```

### 3. Monitoring

**Performance Monitoring:**
```csharp
// Add metrics
services.AddSingleton<IMetrics, AppMetrics>();

// In login handler
using var timer = _metrics.StartTimer("rbac.login.duration");
var user = await _userRepository.GetByEmailWithTenants(query.Email);
timer.Stop();

_metrics.IncrementCounter("rbac.login.success");
```

**Alerting Rules:**
- Login failure rate > 10%
- Users without role assignments > 0
- API response time > 2 seconds
- JWT token validation failures > 5%

---

*Keep this troubleshooting guide updated as new issues are discovered and resolved.*
