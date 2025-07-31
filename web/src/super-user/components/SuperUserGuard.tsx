import React from 'react';
import { Alert, Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { isSuperUser, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';

interface SuperUserGuardProps {
    children: React.ReactNode;
}

export const SuperUserGuard: React.FC<SuperUserGuardProps> = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    // Check if user is authenticated
    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <h4>Authentication Required</h4>
                    <p>You must be logged in to access this page.</p>
                </Alert>
            </Container>
        );
    }

    // Check if user has super user role
    if (!isSuperUser(user)) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>Access Denied</h4>
                    <p>You do not have permission to access this page. Super User privileges are required.</p>
                    <hr />
                    <p className="mb-0">
                        If you believe this is an error, please contact your system administrator.
                    </p>
                </Alert>
            </Container>
        );
    }

    // User is authenticated and has super user role
    return <>{children}</>;
};
