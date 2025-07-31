import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Organization, OrganizationFormData } from '../types';

interface OrganizationModalProps {
    show: boolean;
    onHide: () => void;
    onSubmit: (formData: OrganizationFormData) => Promise<void>;
    organization?: Organization | null;
    loading: boolean;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
    show,
    onHide,
    onSubmit,
    organization,
    loading
}) => {
    const [formData, setFormData] = useState<OrganizationFormData>({
        name: '',
        domain: '',
        adminEmail: '',
        adminName: ''
    });
    const [errors, setErrors] = useState<Partial<OrganizationFormData>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal opens/closes or organization changes
    useEffect(() => {
        if (show) {
            if (organization) {
                setFormData({
                    name: organization.name,
                    domain: organization.domain,
                    adminEmail: organization.adminEmail,
                    adminName: organization.adminName
                });
            } else {
                setFormData({
                    name: '',
                    domain: '',
                    adminEmail: '',
                    adminName: ''
                });
            }
            setErrors({});
        }
    }, [show, organization]);

    const validateForm = (): boolean => {
        const newErrors: Partial<OrganizationFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Organization name is required';
        }

        if (!formData.domain.trim()) {
            newErrors.domain = 'Domain is required';
        } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(formData.domain)) {
            newErrors.domain = 'Please enter a valid domain (e.g., example.com)';
        }

        if (!formData.adminEmail.trim()) {
            newErrors.adminEmail = 'Administrator email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
            newErrors.adminEmail = 'Please enter a valid email address';
        }

        if (!formData.adminName.trim()) {
            newErrors.adminName = 'Administrator name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof OrganizationFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const isEditing = !!organization;
    const title = isEditing ? 'Edit Organization' : 'Add Organization';
    const submitButtonText = isEditing ? 'Save Changes' : 'Create Organization';

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Organization Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="organizationName"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            isInvalid={!!errors.name}
                            placeholder="Enter organization name"
                            disabled={submitting || loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Domain <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="domain"
                            value={formData.domain}
                            onChange={handleInputChange('domain')}
                            isInvalid={!!errors.domain}
                            placeholder="example.com"
                            disabled={submitting || loading || isEditing} // Disable domain editing
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.domain}
                        </Form.Control.Feedback>
                        {isEditing && (
                            <Form.Text className="text-muted">
                                Domain cannot be changed after organization creation
                            </Form.Text>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Administrator Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="email"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleInputChange('adminEmail')}
                            isInvalid={!!errors.adminEmail}
                            placeholder="admin@example.com"
                            disabled={submitting || loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.adminEmail}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Administrator Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleInputChange('adminName')}
                            isInvalid={!!errors.adminName}
                            placeholder="Enter administrator full name"
                            disabled={submitting || loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.adminName}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {!isEditing && (
                        <Alert variant="info">
                            <strong>Note:</strong> The administrator will receive an email with login credentials
                            and setup instructions after the organization is created.
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={submitting || loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={submitting || loading}
                    >
                        {submitting ? 'Saving...' : submitButtonText}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
