import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { Organization, OrganizationFilters, OrganizationFormData } from '../types';
import { useOrganizations } from '../hooks/useOrganizations';
import { PaginationComponent } from '../../common/components';
import { OrganizationModal } from './OrganizationModal';
import { OrganizationFiltersComponent } from './OrganizationFilters';
import '../SuperUser.css';

export const SuperUserDashboard: React.FC = () => {
    const {
        organizations,
        loading,
        error,
        pagination,
        fetchOrganizations,
        createOrganization,
        updateOrganization,
        deactivateOrganization
    } = useOrganizations();

    const [filters, setFilters] = useState<OrganizationFilters>({
        status: 'all',
        search: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<string | null>(null);

    // Fetch organizations on component mount and when filters change
    useEffect(() => {
        fetchOrganizations(filters, 1);
    }, [fetchOrganizations, filters]);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleFilterChange = (newFilters: OrganizationFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        fetchOrganizations(filters, page);
    };

    const handleCreateOrganization = () => {
        setEditingOrganization(null);
        setShowModal(true);
    };

    const handleEditOrganization = (organization: Organization) => {
        setEditingOrganization(organization);
        setShowModal(true);
    };

    const handleModalSubmit = async (formData: OrganizationFormData) => {
        let result;

        if (editingOrganization) {
            result = await updateOrganization(editingOrganization.id, formData);
        } else {
            result = await createOrganization(formData);
        }

        if (result.success) {
            setShowModal(false);
            setSuccessMessage(result.message || 'Operation completed successfully');
            // Refresh the list
            fetchOrganizations(filters, pagination.currentPage);
        }
    };

    const handleDeactivateOrganization = (organizationId: string) => {
        setShowDeactivateConfirm(organizationId);
    };

    const confirmDeactivation = async () => {
        if (showDeactivateConfirm) {
            const result = await deactivateOrganization(showDeactivateConfirm);
            if (result.success) {
                setSuccessMessage(result.message || 'Organization deactivated successfully');
            }
            setShowDeactivateConfirm(null);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        return status === 'Active' ? 'success' : 'secondary';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="dashboard-title mb-0">Organization Management</h1>
                        <Button
                            variant="primary"
                            onClick={handleCreateOrganization}
                            disabled={loading}
                        >
                            <i className="bi bi-plus-lg"></i> Add Organization
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Success Message */}
            {successMessage && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
                            {successMessage}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Error Message */}
            {error && (
                <Row className="mb-3">
                    <Col>
                        <Alert variant="danger" dismissible onClose={() => setSuccessMessage('')}>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <OrganizationFiltersComponent
                                filters={filters}
                                onFiltersChange={handleFilterChange}
                                loading={loading}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Organizations Table */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center p-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table className="table-bordered align-middle bg-white mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Name</th>
                                                <th>Domain</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Admin</th>
                                                <th>Users</th>
                                                <th>Cases</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {organizations.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-4 text-muted">
                                                        No organizations found
                                                    </td>
                                                </tr>
                                            ) : (
                                                organizations.map(organization => (
                                                    <tr key={organization.id}>
                                                        <td>
                                                            <strong>{organization.name}</strong>
                                                        </td>
                                                        <td>{organization.domain}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(organization.status)}>
                                                                {organization.status}
                                                            </Badge>
                                                        </td>
                                                        <td>{formatDate(organization.createdDate)}</td>
                                                        <td>
                                                            {organization.adminName} ({organization.adminEmail})
                                                        </td>
                                                        <td>{organization.userCount || 0}</td>
                                                        <td>{organization.caseCount || 0}</td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleEditOrganization(organization)}
                                                                    disabled={loading}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() => {/* TODO: Implement view details */ }}
                                                                    disabled={loading}
                                                                >
                                                                    View
                                                                </Button>
                                                                {organization.status === 'Active' && (
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeactivateOrganization(organization.id)}
                                                                        disabled={loading}
                                                                    >
                                                                        Deactivate
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Row>
                    <Col>
                        <PaginationComponent
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            disabled={loading}
                        />
                    </Col>
                </Row>
            )}

            {/* Organization Modal */}
            <OrganizationModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                organization={editingOrganization}
                loading={loading}
            />

            {/* Deactivation Confirmation Modal */}
            <Modal show={!!showDeactivateConfirm} onHide={() => setShowDeactivateConfirm(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deactivation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to deactivate this organization?</p>
                    <p className="text-muted">
                        This action will disable access for all users in the organization.
                        Existing case data will be preserved according to retention policies.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeactivateConfirm(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeactivation} disabled={loading}>
                        {loading ? 'Deactivating...' : 'Deactivate Organization'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
