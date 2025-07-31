# API Documentation: Multi-Tenant RBAC Endpoints

## Overview

This document describes the API endpoints related to authentication, authorization, and multi-tenant role-based access control in the OpenCMS platform.

## Authentication Endpoints

### POST /api/authentication/login

Authenticates a user and returns user information with role and tenant details.

#### Request

```http
POST /api/authentication/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Response

**Success (200 OK):**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "primaryRole": "Administrator",
  "tenants": [
    {
      "tenantId": "tenant-uuid-1",
      "tenantName": "Acme Corporation",
      "roleName": "Administrator"
    },
    {
      "tenantId": "tenant-uuid-2", 
      "tenantName": "Beta Industries",
      "roleName": "Investigator"
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "Invalid email or password."
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Invalid login request"
}
```

#### JWT Token Claims

The returned JWT token contains the following claims:

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "primaryRole": "Administrator",
  "role": ["Administrator", "Investigator"],
  "tenant": ["tenant-uuid-1", "tenant-uuid-2"],
  "exp": 1643723400,
  "iat": 1643721600
}
```

### POST /api/authentication/forgot-password

Initiates a password reset process for a user.

#### Request

```http
POST /api/authentication/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

**Error (404 Not Found):**
```json
{
  "message": "User not found"
}
```

### POST /api/authentication/reset-password

Resets a user's password using a reset token.

#### Request

```http
POST /api/authentication/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset-token-here",
  "newPassword": "newsecurepassword123"
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Invalid request"
}
```

## User Management Endpoints

### GET /api/users/me

Returns the current authenticated user's information with roles and tenants.

#### Request

```http
GET /api/users/me
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200 OK):**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "primaryRole": "Administrator",
  "tenants": [
    {
      "tenantId": "tenant-uuid-1",
      "tenantName": "Acme Corporation", 
      "roleName": "Administrator"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/users

Lists users accessible to the current user (Super Users see all, Administrators see tenant users).

#### Request

```http
GET /api/users?tenantId=tenant-uuid&role=Administrator&page=1&pageSize=20
Authorization: Bearer <jwt-token>
```

#### Query Parameters

- `tenantId` (optional): Filter users by tenant
- `role` (optional): Filter users by role
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)

#### Response

**Success (200 OK):**
```json
{
  "users": [
    {
      "userId": "user-uuid-1",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "primaryRole": "Administrator",
      "tenants": [
        {
          "tenantId": "tenant-uuid-1",
          "tenantName": "Acme Corporation",
          "roleName": "Administrator"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

### POST /api/users

Creates a new user (Super User and Administrator only).

#### Request

```http
POST /api/users
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "securepassword123",
  "tenantAssignments": [
    {
      "tenantId": "tenant-uuid-1",
      "roleId": "role-uuid-1"
    }
  ]
}
```

#### Response

**Success (201 Created):**
```json
{
  "userId": "new-user-uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "createdAt": "2024-01-20T15:30:00Z"
}
```

### PUT /api/users/{userId}/roles

Updates a user's role assignments (Super User and Administrator only).

#### Request

```http
PUT /api/users/user-uuid-here/roles
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "tenantAssignments": [
    {
      "tenantId": "tenant-uuid-1",
      "roleId": "role-uuid-1"
    },
    {
      "tenantId": "tenant-uuid-2", 
      "roleId": "role-uuid-2"
    }
  ]
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "User roles updated successfully"
}
```

## Tenant Management Endpoints

### GET /api/tenants

Lists tenants accessible to the current user.

#### Request

```http
GET /api/tenants?status=active&page=1&pageSize=20
Authorization: Bearer <jwt-token>
```

#### Query Parameters

- `status` (optional): Filter by status (active, inactive, all)
- `search` (optional): Search by tenant name
- `page` (optional): Page number
- `pageSize` (optional): Items per page

#### Response

**Success (200 OK):**
```json
{
  "tenants": [
    {
      "tenantId": "tenant-uuid-1",
      "name": "Acme Corporation",
      "description": "Leading technology company",
      "isActive": true,
      "userCount": 15,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20, 
    "totalItems": 8,
    "totalPages": 1
  }
}
```

### POST /api/tenants

Creates a new tenant (Super User only).

#### Request

```http
POST /api/tenants
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "New Corporation",
  "description": "A new tenant organization",
  "isActive": true
}
```

#### Response

**Success (201 Created):**
```json
{
  "tenantId": "new-tenant-uuid",
  "name": "New Corporation",
  "description": "A new tenant organization",
  "isActive": true,
  "createdAt": "2024-01-20T15:30:00Z"
}
```

### PUT /api/tenants/{tenantId}

Updates tenant information (Super User only).

#### Request

```http
PUT /api/tenants/tenant-uuid-here
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Corporation Name",
  "description": "Updated description",
  "isActive": false
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Tenant updated successfully"
}
```

### DELETE /api/tenants/{tenantId}

Deactivates a tenant (Super User only).

#### Request

```http
DELETE /api/tenants/tenant-uuid-here
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Tenant deactivated successfully"
}
```

## Role Management Endpoints

### GET /api/roles

Lists all available roles in the system.

#### Request

```http
GET /api/roles
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200 OK):**
```json
{
  "roles": [
    {
      "roleId": "role-uuid-1",
      "name": "Super User",
      "description": "System administrator with full platform access",
      "sortOrder": 10
    },
    {
      "roleId": "role-uuid-2",
      "name": "Administrator", 
      "description": "Tenant administrator with user management capabilities",
      "sortOrder": 20
    }
  ]
}
```

## Authorization Endpoints

### GET /api/authorization/permissions

Gets the current user's permissions and accessible resources.

#### Request

```http
GET /api/authorization/permissions?tenantId=tenant-uuid
Authorization: Bearer <jwt-token>
```

#### Response

**Success (200 OK):**
```json
{
  "userId": "user-uuid",
  "permissions": {
    "canManageUsers": true,
    "canManageTenants": false,
    "canViewAuditLogs": true,
    "canManageCases": true
  },
  "accessibleTenants": [
    {
      "tenantId": "tenant-uuid-1",
      "tenantName": "Acme Corporation",
      "roleName": "Administrator"
    }
  ],
  "isSuperUser": false,
  "isAdministrator": true
}
```

### POST /api/authorization/check

Checks if the current user has specific permissions.

#### Request

```http
POST /api/authorization/check
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "manage_users",
  "tenantId": "tenant-uuid-1",
  "resource": "user_management"
}
```

#### Response

**Success (200 OK):**
```json
{
  "hasPermission": true,
  "reason": "User has Administrator role in specified tenant"
}
```

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
  "error": "BadRequest",
  "message": "The request was invalid or malformed",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized", 
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "requiredRole": "Administrator"
}
```

#### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "The requested resource was not found"
}
```

#### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "A user with this email already exists"
}
```

#### 422 Unprocessable Entity
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": [
    {
      "field": "password",
      "error": "Password must be at least 8 characters long"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "traceId": "trace-uuid-here"
}
```

## Rate Limiting

### Authentication Endpoints

- **Login**: 5 attempts per minute per IP
- **Password Reset**: 3 attempts per hour per email
- **Token Validation**: 60 requests per minute per user

### Management Endpoints

- **User Management**: 100 requests per minute per user
- **Tenant Management**: 50 requests per minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1643723400
```

## Pagination

All list endpoints support pagination with the following parameters:

- `page`: Page number (1-based, default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

### Pagination Response Format

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Filtering and Sorting

### Common Query Parameters

- `search`: Text search across relevant fields
- `sortBy`: Field to sort by
- `sortDirection`: `asc` or `desc` (default: `asc`)
- `createdAfter`: Filter by creation date (ISO 8601)
- `createdBefore`: Filter by creation date (ISO 8601)

### Example

```http
GET /api/users?search=john&sortBy=email&sortDirection=desc&createdAfter=2024-01-01T00:00:00Z
```

## API Versioning

The API uses URL versioning:

- Current version: `/api/v1/`
- Future versions: `/api/v2/`

### Version Header

```http
X-API-Version: 1.0
```

## Security Headers

### Required Request Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

### Security Response Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## WebSocket Endpoints (Future)

### Real-time Permission Updates

```javascript
// Connect to permission updates
const ws = new WebSocket('wss://api.example.com/ws/permissions');

// Listen for role changes
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'role_updated') {
    // Refresh user permissions
    refreshUserPermissions();
  }
};
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { OpenCmsApiClient } from '@opencms/api-client';

const client = new OpenCmsApiClient({
  baseUrl: 'https://api.opencms.example.com',
  token: 'your-jwt-token'
});

// Login
const loginResponse = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const user = await client.users.getCurrentUser();

// Check permissions
const hasPermission = await client.authorization.check({
  action: 'manage_users',
  tenantId: 'tenant-uuid'
});
```

### C# .NET

```csharp
using OpenCms.ApiClient;

var client = new OpenCmsApiClient("https://api.opencms.example.com")
{
    Token = "your-jwt-token"
};

// Login
var loginResponse = await client.Auth.LoginAsync(new LoginRequest
{
    Email = "user@example.com",
    Password = "password"
});

// Get current user
var user = await client.Users.GetCurrentUserAsync();

// Check permissions
var hasPermission = await client.Authorization.CheckAsync(new PermissionCheckRequest
{
    Action = "manage_users",
    TenantId = Guid.Parse("tenant-uuid")
});
```

---

*This API documentation should be updated whenever new endpoints are added or existing ones are modified.*
