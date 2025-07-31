# Super User Module

This module provides the Super User interface for the OpenCMS Case Management System. It allows super users to manage customer organizations and maintain system-wide oversight.

## Features

### Organization Management
- **Create Organizations**: Add new customer organizations with initial administrator assignment
- **Edit Organizations**: Update organization details and change administrators
- **Deactivate Organizations**: Safely deactivate organizations while preserving data
- **Organization Listing**: View all organizations with filtering and search capabilities
- **Status Management**: Track organization status (Active/Inactive)

### Access Control
- **Super User Guard**: Ensures only users with Super User role can access the interface
- **Authentication Check**: Verifies user is logged in before allowing access
- **Role Validation**: Validates user has the required Super User privileges

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Bootstrap Components**: Professional UI using React Bootstrap
- **Interactive Tables**: Sortable and filterable organization listings
- **Modal Dialogs**: User-friendly forms for creating and editing organizations
- **Pagination**: Efficient handling of large organization lists

## Component Structure

```
web/src/super-user/
├── components/
│   ├── SuperUserDashboard.tsx     # Main dashboard component
│   ├── SuperUserGuard.tsx         # Access control wrapper
│   ├── SuperUserLayout.tsx        # Layout with navigation
│   ├── OrganizationModal.tsx      # Create/edit organization modal
│   ├── OrganizationFilters.tsx    # Filtering component
│   └── Pagination.tsx             # Pagination component
├── hooks/
│   └── useOrganizations.ts        # Organization management hook
├── types/
│   └── index.ts                   # TypeScript type definitions
├── SuperUserPage.tsx              # Main page component
├── SuperUser.css                  # Custom styles
└── index.ts                       # Module exports
```

## Usage

### Basic Setup

```tsx
import { SuperUserPage } from './super-user/SuperUserPage';

// Use in your router
<Route path="/super-user" component={SuperUserPage} />
```

### Individual Components

```tsx
import { 
  SuperUserDashboard, 
  SuperUserGuard, 
  SuperUserLayout 
} from './super-user';

// Custom layout
<SuperUserGuard>
  <SuperUserLayout>
    <YourCustomComponent />
  </SuperUserLayout>
</SuperUserGuard>
```

### Using the Organizations Hook

```tsx
import { useOrganizations } from './super-user/hooks/useOrganizations';

const MyComponent = () => {
  const {
    organizations,
    loading,
    error,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deactivateOrganization
  } = useOrganizations();

  // Use the hook methods...
};
```

## API Integration

The module currently uses mock data but is designed to integrate with a REST API. Replace the `OrganizationService` class in `useOrganizations.ts` with actual API calls.

### Expected API Endpoints

- `GET /api/organizations` - List organizations with filtering and pagination
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Deactivate organization

### Expected Response Format

```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
}
```

## Styling

The module includes custom CSS (`SuperUser.css`) that extends Bootstrap with:
- Custom color schemes
- Enhanced form styling
- Responsive design improvements
- Loading state animations
- Professional table styling

## Testing

The module is designed to work with the Playwright tests created in the `testing/tests/` directory:

- `superuser-organization-management.spec.ts`
- `superuser-audit-monitoring.spec.ts`
- `superuser-platform-configuration.spec.ts`
- `superuser-integration.spec.ts`

## Security Considerations

- **Role-based Access**: Only users with 'SuperUser' role can access the interface
- **Input Validation**: All form inputs are validated on the client side
- **CSRF Protection**: Use proper CSRF tokens when integrating with the API
- **Audit Logging**: All actions should be logged for compliance

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live organization updates
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Bulk Operations**: Select multiple organizations for batch operations
4. **Export Functionality**: Export organization data to CSV/PDF
5. **Organization Details**: Detailed view with statistics and user management
6. **System Metrics**: Dashboard widgets showing system health and statistics

## Dependencies

- React 19+
- React Bootstrap 2.10+
- Redux Toolkit (for state management)
- TypeScript
- Bootstrap 5.3+
- Bootstrap Icons (for UI icons)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- **Lazy Loading**: Components are designed for code splitting
- **Pagination**: Large datasets are paginated to maintain performance
- **Debounced Search**: Search inputs use debouncing to reduce API calls
- **Optimistic Updates**: UI updates immediately while API calls are in progress
- **Error Boundaries**: Graceful error handling prevents crashes

## Contributing

When contributing to this module:

1. Follow the existing component structure
2. Add TypeScript types for all new interfaces
3. Include proper error handling
4. Write tests for new functionality
5. Update this README with any new features
