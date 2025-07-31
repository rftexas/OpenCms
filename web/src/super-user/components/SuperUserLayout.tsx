import React from 'react';
import { Container, Row, Col, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Outlet, Link, useLocation } from 'react-router';

interface SuperUserLayoutProps {
    // No children prop needed - using Outlet for nested routes
}

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

export const SuperUserLayout: React.FC<SuperUserLayoutProps> = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    const handleLogout = () => {
        // TODO: Implement logout functionality
        console.log('Logout clicked');
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Top Navigation */}
            <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
                <Container fluid>
                    <Navbar.Brand href="#" className="fw-bold">
                        OpenCMS - Super User
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/super-user/organizations"
                                className={location.pathname.includes('organizations') || location.pathname === '/super-user' ? 'active' : ''}
                            >
                                Organizations
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/super-user/audit"
                                className={location.pathname.includes('audit') ? 'active' : ''}
                            >
                                Audit Logs
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/super-user/settings"
                                className={location.pathname.includes('settings') ? 'active' : ''}
                            >
                                System Settings
                            </Nav.Link>
                        </Nav>

                        <Nav>
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="outline-secondary"
                                    id="user-dropdown"
                                    className="d-flex align-items-center"
                                >
                                    <div
                                        className="user-avatar me-2"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {user ? getUserInitials(user.name) : 'SU'}
                                    </div>
                                    <div className="text-start">
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                                            {user?.name || 'Super User'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                            {user?.role || 'Super User'}
                                        </div>
                                    </div>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#profile">
                                        <i className="bi bi-person me-2"></i>
                                        Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item href="#settings">
                                        <i className="bi bi-gear me-2"></i>
                                        Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Main Content */}
            <div className="d-flex">
                {/* Sidebar */}
                <nav className="sidebar bg-white border-end" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
                    <div className="p-3">
                        <h6 className="text-muted mb-3">NAVIGATION</h6>
                        <Nav className="flex-column">
                            <Nav.Link
                                as={Link}
                                to="/super-user/organizations"
                                className={`d-flex align-items-center py-2 ${location.pathname.includes('organizations') || location.pathname === '/super-user' ? 'active' : ''}`}
                                style={{ borderRadius: '6px' }}
                            >
                                <i className="bi bi-building me-2"></i>
                                Organizations
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/super-user/audit"
                                className={`d-flex align-items-center py-2 ${location.pathname.includes('audit') ? 'active' : ''}`}
                                style={{ borderRadius: '6px' }}
                            >
                                <i className="bi bi-list-check me-2"></i>
                                Audit Logs
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/super-user/settings"
                                className={`d-flex align-items-center py-2 ${location.pathname.includes('settings') ? 'active' : ''}`}
                                style={{ borderRadius: '6px' }}
                            >
                                <i className="bi bi-gear me-2"></i>
                                System Settings
                            </Nav.Link>
                        </Nav>
                    </div>

                    <div className="p-3 border-top mt-auto">
                        <h6 className="text-muted mb-3">SYSTEM STATUS</h6>
                        <div className="small">
                            <div className="d-flex justify-content-between mb-2">
                                <span>System Health:</span>
                                <span className="badge bg-success">Good</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Active Orgs:</span>
                                <span>12</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Total Users:</span>
                                <span>247</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main className="flex-grow-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
