import React from 'react';
import { SuperUserGuard } from './components/SuperUserGuard';
import { SuperUserLayout } from './components/SuperUserLayout';
import { SuperUserDashboard } from './components/SuperUserDashboard';

/**
 * Super User Organization Management Page
 * 
 * This is the main entry point for Super User functionality.
 * It includes:
 * - Access control (SuperUserGuard)
 * - Layout with navigation (SuperUserLayout) 
 * - Organization management interface (SuperUserDashboard)
 */
export const SuperUserPage: React.FC = () => {
    return (
        <SuperUserGuard>
            <SuperUserLayout>
                <SuperUserDashboard />
            </SuperUserLayout>
        </SuperUserGuard>
    );
};

export default SuperUserPage;
