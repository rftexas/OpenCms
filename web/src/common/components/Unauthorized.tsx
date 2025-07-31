import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

interface AuthState {
    user: {
        role: string;
        email: string;
        name: string;
    } | null;
}

interface RootState {
    auth: AuthState;
}

/**
 * Unauthorized Access Component
 * 
 * Displayed when a user has an unrecognized role or insufficient permissions.
 */
export const Unauthorized: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        // TODO: Implement actual logout functionality
        window.location.href = '/login';
    };

    return (
        <Container className="py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="text-center">
                        <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
                        <h1 className="mt-4">Access Denied</h1>
                        <p className="lead text-muted">
                            You don't have permission to access this application.
                        </p>

                        <Alert variant="info" className="mt-4">
                            <Alert.Heading>Account Information</Alert.Heading>
                            <p className="mb-2">
                                <strong>User:</strong> {user?.name || 'Unknown'}
                            </p>
                            <p className="mb-2">
                                <strong>Email:</strong> {user?.email || 'Unknown'}
                            </p>
                            <p className="mb-0">
                                <strong>Role:</strong> {user?.role || 'Unknown'}
                            </p>
                        </Alert>

                        <div className="mt-4">
                            <p className="text-muted">
                                If you believe this is an error, please contact your system administrator.
                            </p>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                                <Link to="/contact-support">
                                    <Button variant="primary">
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};
