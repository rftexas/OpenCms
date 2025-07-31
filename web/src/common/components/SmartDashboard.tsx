import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { hasRole, isAdministrator, isSuperUser, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';

/**
 * Smart Dashboard Component
 * 
 * Automatically redirects users to their appropriate dashboard based on their role.
 * This provides a single entry point (/dashboard) that routes to role-specific interfaces.
 */
export const SmartDashboard: React.FC = () => {
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        // Route based on user role - check in priority order
        if (isSuperUser(user)) {
            navigate('/super-user');
        } else if (isAdministrator(user)) {
            navigate('/admin');
        } else if (hasRole(user, 'Investigator')) {
            navigate('/investigator');
        } else if (hasRole(user, 'Reviewer')) {
            navigate('/reviewer');
        } else if (hasRole(user, 'Reporter')) {
            navigate('/reporter');
        } else {
            // For unknown roles, show a fallback or redirect to a general dashboard
            navigate('/unauthorized');
        }
    }, [user, isAuthenticated, navigate]);

    // Show loading while determining route
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};
