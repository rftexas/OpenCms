# RBAC Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing role-based access control features in the OpenCMS platform. Use this guide when adding new roles, permissions, or tenant-specific functionality.

## Quick Reference

### Adding a New Role

1. **Update Role.cs**:
```csharp
public static class WellKnownRoles
{
    public const string SuperUser = "Super User";
    public const string Administrator = "Administrator";
    public const string YourNewRole = "Your New Role"; // Add here
}
```

2. **Create Database Migration**:
```sql
INSERT INTO role (role_id, name, description, sort_order) 
VALUES (gen_random_uuid(), 'Your New Role', 'Description here', 60);
```

3. **Add Frontend Role Check**:
```typescript
export const isYourNewRole = (user: User | null): boolean => {
    return hasRole(user, 'Your New Role');
};
```

4. **Create Route Guard**:
```typescript
export const YourNewRoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useSelector(selectCurrentUser);
    
    if (!isYourNewRole(user)) {
        return <Unauthorized message="Your New Role privileges required" />;
    }
    
    return <>{children}</>;
};
```

### Adding Tenant-Specific API Endpoint

```csharp
[HttpGet("{tenantId}/data")]
[Authorize]
public async Task<IActionResult> GetTenantData(Guid tenantId)
{
    var user = await GetCurrentUserWithTenants();
    
    // Check access
    if (!user.HasAccessToTenant(TenantId.From(tenantId)) && !user.IsSuperUser())
    {
        return Forbid("Access denied to this tenant");
    }
    
    // Your implementation here
    var data = await _service.GetDataForTenant(TenantId.From(tenantId));
    return Ok(data);
}
```

### Creating Role-Specific Component

```typescript
interface RoleSpecificComponentProps {
    tenantId?: string;
}

export const RoleSpecificComponent: React.FC<RoleSpecificComponentProps> = ({ tenantId }) => {
    const user = useSelector(selectCurrentUser);
    
    // Check if user has access to this tenant
    const hasAccess = tenantId 
        ? user?.tenants.some(t => t.tenantId === tenantId) || isSuperUser(user)
        : true;
    
    if (!hasAccess) {
        return <div>Access denied to this tenant</div>;
    }
    
    if (isSuperUser(user)) {
        return <SuperUserView />;
    } else if (isAdministrator(user)) {
        return <AdminView tenantId={tenantId} />;
    } else {
        return <StandardView tenantId={tenantId} />;
    }
};
```

## Implementation Patterns

### 1. Repository Pattern with Tenant Filtering

```csharp
public interface ITenantAwareRepository<TEntity> : IRepository<TEntity>
{
    Task<IEnumerable<TEntity>> GetByTenantAsync(TenantId tenantId);
    Task<TEntity?> GetByIdAndTenantAsync(Guid id, TenantId tenantId);
}

public class TenantAwareCaseRepository : ITenantAwareRepository<Case>
{
    public async Task<IEnumerable<Case>> GetByTenantAsync(TenantId tenantId)
    {
        return await _context.Cases
            .Where(c => c.TenantId == tenantId)
            .ToListAsync();
    }
    
    public async Task<Case?> GetByIdAndTenantAsync(Guid id, TenantId tenantId)
    {
        return await _context.Cases
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);
    }
}
```

### 2. Authorization Service

```csharp
public interface IAuthorizationService
{
    Task<bool> CanAccessTenantAsync(UserId userId, TenantId tenantId);
    Task<bool> HasRoleInTenantAsync(UserId userId, TenantId tenantId, string roleName);
    Task<IEnumerable<TenantId>> GetAccessibleTenantsAsync(UserId userId);
}

public class AuthorizationService : IAuthorizationService
{
    private readonly IUserRepository _userRepository;
    
    public async Task<bool> CanAccessTenantAsync(UserId userId, TenantId tenantId)
    {
        var user = await _userRepository.GetByIdWithTenants(userId);
        return user?.IsSuperUser() == true || user?.HasAccessToTenant(tenantId) == true;
    }
    
    public async Task<bool> HasRoleInTenantAsync(UserId userId, TenantId tenantId, string roleName)
    {
        var user = await _userRepository.GetByIdWithTenants(userId);
        return user?.UserTenants
            .Any(ut => ut.TenantId == tenantId && ut.Role?.Name == roleName) == true;
    }
}
```

### 3. Frontend Hook for Role Management

```typescript
export const useUserPermissions = () => {
    const user = useSelector(selectCurrentUser);
    
    return useMemo(() => ({
        isSuperUser: isSuperUser(user),
        isAdministrator: isAdministrator(user),
        hasRole: (roleName: string) => hasRole(user, roleName),
        getTenantsByRole: (roleName: string) => getTenantsByRole(user, roleName),
        canAccessTenant: (tenantId: string) => {
            return isSuperUser(user) || 
                   user?.tenants.some(t => t.tenantId === tenantId) || false;
        },
        getAccessibleTenants: () => user?.tenants || []
    }), [user]);
};

// Usage in component
const MyComponent: React.FC = () => {
    const permissions = useUserPermissions();
    
    if (permissions.isSuperUser) {
        return <SuperUserInterface />;
    }
    
    const adminTenants = permissions.getTenantsByRole('Administrator');
    return <AdminInterface tenants={adminTenants} />;
};
```

### 4. Multi-Tenant Data Seeding

```csharp
public class RoleSeeder
{
    public static async Task SeedAsync(DataContext context)
    {
        var roles = new[]
        {
            new { Id = Guid.NewGuid(), Name = "Super User", Description = "System administrator with full access", SortOrder = 10 },
            new { Id = Guid.NewGuid(), Name = "Administrator", Description = "Tenant administrator", SortOrder = 20 },
            new { Id = Guid.NewGuid(), Name = "Investigator", Description = "Case investigator", SortOrder = 30 },
            new { Id = Guid.NewGuid(), Name = "Reviewer", Description = "Case reviewer", SortOrder = 40 },
            new { Id = Guid.NewGuid(), Name = "Reporter", Description = "Case reporter", SortOrder = 50 }
        };
        
        foreach (var role in roles)
        {
            if (!await context.Roles.AnyAsync(r => r.Name == role.Name))
            {
                context.Roles.Add(Role.Create(role.Name, role.Description, role.SortOrder));
            }
        }
        
        await context.SaveChangesAsync();
    }
}
```

## Testing Strategies

### 1. Unit Tests for Role Logic

```csharp
[Test]
public void User_IsSuperUser_ReturnsTrueForSuperUserRole()
{
    // Arrange
    var user = UserBuilder.Create()
        .WithEmail("admin@test.com")
        .WithUserTenant(tenantId, Role.WellKnownRoles.SuperUser)
        .Build();
    
    // Act
    var result = user.IsSuperUser();
    
    // Assert
    Assert.IsTrue(result);
}

[Test]
public void User_HasAccessToTenant_ReturnsTrueWhenUserHasAccess()
{
    // Arrange
    var tenantId = TenantId.New();
    var user = UserBuilder.Create()
        .WithUserTenant(tenantId, Role.WellKnownRoles.Administrator)
        .Build();
    
    // Act
    var result = user.HasAccessToTenant(tenantId);
    
    // Assert
    Assert.IsTrue(result);
}
```

### 2. Integration Tests for API Endpoints

```csharp
[Test]
public async Task GetTenantData_ReturnsUnauthorized_WhenUserHasNoAccess()
{
    // Arrange
    var client = CreateClientWithUser("user@test.com", Role.WellKnownRoles.Reporter);
    var tenantId = Guid.NewGuid();
    
    // Act
    var response = await client.GetAsync($"/api/tenants/{tenantId}/data");
    
    // Assert
    Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
}
```

### 3. Frontend Component Tests

```typescript
describe('SuperUserGuard', () => {
    it('renders children when user is super user', () => {
        const mockUser: User = {
            id: '1',
            email: 'admin@test.com',
            name: 'Admin',
            primaryRole: 'Super User',
            tenants: []
        };
        
        render(
            <Provider store={createMockStore({ auth: { user: mockUser } })}>
                <SuperUserGuard>
                    <div>Protected Content</div>
                </SuperUserGuard>
            </Provider>
        );
        
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    it('shows access denied when user is not super user', () => {
        const mockUser: User = {
            id: '1',
            email: 'user@test.com',
            name: 'User',
            primaryRole: 'Reporter',
            tenants: []
        };
        
        render(
            <Provider store={createMockStore({ auth: { user: mockUser } })}>
                <SuperUserGuard>
                    <div>Protected Content</div>
                </SuperUserGuard>
            </Provider>
        );
        
        expect(screen.getByText(/Access Denied/)).toBeInTheDocument();
    });
});
```

## Performance Considerations

### 1. Eager Loading Strategy

```csharp
// Load user with minimal required data
public async Task<User?> GetByEmailForAuthentication(Email email)
{
    return await _context.Users
        .Include(u => u.UserTenants)
        .ThenInclude(ut => ut.Role)
        .Include(u => u.UserTenants)
        .ThenInclude(ut => ut.Tenant)
        .AsNoTracking()
        .FirstOrDefaultAsync(u => u.Email == email);
}
```

### 2. Frontend Memoization

```typescript
export const useRolePermissions = (user: User | null) => {
    return useMemo(() => {
        if (!user) return { canAccessAny: false, accessibleTenants: [] };
        
        return {
            canAccessAny: user.tenants.length > 0 || isSuperUser(user),
            accessibleTenants: user.tenants,
            rolesByTenant: user.tenants.reduce((acc, tenant) => {
                acc[tenant.tenantId] = tenant.roleName;
                return acc;
            }, {} as Record<string, string>)
        };
    }, [user]);
};
```

### 3. Caching Strategy

```csharp
public class CachedAuthorizationService : IAuthorizationService
{
    private readonly IAuthorizationService _inner;
    private readonly IMemoryCache _cache;
    
    public async Task<bool> CanAccessTenantAsync(UserId userId, TenantId tenantId)
    {
        var cacheKey = $"auth:{userId}:{tenantId}";
        
        if (_cache.TryGetValue(cacheKey, out bool canAccess))
        {
            return canAccess;
        }
        
        canAccess = await _inner.CanAccessTenantAsync(userId, tenantId);
        _cache.Set(cacheKey, canAccess, TimeSpan.FromMinutes(5));
        
        return canAccess;
    }
}
```

## Security Checklist

### Backend Security
- [ ] All API endpoints check user permissions
- [ ] Tenant data is properly isolated
- [ ] JWT tokens contain necessary claims
- [ ] Role hierarchy is enforced
- [ ] Database queries include tenant filtering
- [ ] Authorization failures are logged

### Frontend Security
- [ ] Route guards protect sensitive pages
- [ ] Components check user permissions
- [ ] Sensitive data is not exposed in DOM
- [ ] JWT tokens are stored securely
- [ ] Role checks are consistent across components

### Database Security
- [ ] Foreign key constraints are in place
- [ ] Role assignments are validated
- [ ] Audit trails track permission changes
- [ ] Data access is logged
- [ ] Principle of least privilege is followed

## Common Pitfalls

### 1. Not Checking Permissions in API
```csharp
// ❌ BAD: No permission check
[HttpGet("{id}")]
public async Task<Case> GetCase(Guid id)
{
    return await _repository.GetByIdAsync(id);
}

// ✅ GOOD: Proper permission check
[HttpGet("{id}")]
public async Task<IActionResult> GetCase(Guid id)
{
    var user = await GetCurrentUserWithTenants();
    var case = await _repository.GetByIdAsync(id);
    
    if (case == null) return NotFound();
    
    if (!user.HasAccessToTenant(case.TenantId) && !user.IsSuperUser())
    {
        return Forbid();
    }
    
    return Ok(case);
}
```

### 2. Frontend Role Logic Inconsistency
```typescript
// ❌ BAD: Inconsistent role checking
const isAdmin = user?.primaryRole === 'admin' || user?.primaryRole === 'Admin';

// ✅ GOOD: Use helper functions
const isAdmin = isAdministrator(user);
```

### 3. Forgetting Tenant Context
```typescript
// ❌ BAD: No tenant context
const canEdit = isAdministrator(user);

// ✅ GOOD: Include tenant context
const canEdit = isAdministrator(user) && 
                user?.tenants.some(t => t.tenantId === currentTenantId);
```

## Migration Strategies

### Adding RBAC to Existing System

1. **Phase 1: Add Domain Models**
   - Create Tenant, Role, UserTenant entities
   - Set up Entity Framework configurations
   - Create database migrations

2. **Phase 2: Update Authentication**
   - Modify login process to load tenant/role data
   - Update JWT token generation
   - Add role checking helper functions

3. **Phase 3: Frontend Integration**
   - Update Redux state structure
   - Add role checking hooks and guards
   - Update existing components

4. **Phase 4: API Protection**
   - Add authorization checks to controllers
   - Implement tenant-aware repositories
   - Update existing endpoints

5. **Phase 5: Testing & Validation**
   - Add comprehensive tests
   - Perform security audit
   - Load test with multi-tenant data

---

*Keep this guide updated as new patterns and practices are discovered during implementation.*
