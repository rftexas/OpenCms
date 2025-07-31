import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

interface AuthState {
    user: {
        role: string;
        email: string;
        name: string;
    } | null;
    isAuthenticated: boolean;
}

interface RootState {
    auth: AuthState;
}

/**
 * Role-based Dashboard Redirect Component
 * 
 * Alternative implementation that uses Navigate component for immediate redirect.
 * This approach is more direct but less flexible for custom loading states.
 */
export const RoleDashboard: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Direct navigation based on role
    switch (user.role.toLowerCase()) {
        case 'superuser':
        case 'super-user':
        case 'super_user':
            return <Navigate to="/super-user" replace />;

        case 'administrator':
        case 'admin':
            return <Navigate to="/admin" replace />;

        case 'investigator':
            return <Navigate to="/investigator" replace />;

        case 'reviewer':
            return <Navigate to="/reviewer" replace />;

        default:
            return <Navigate to="/unauthorized" replace />;
    }
};
