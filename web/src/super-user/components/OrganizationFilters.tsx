import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { OrganizationFilters } from '../types';

interface OrganizationFiltersProps {
    filters: OrganizationFilters;
    onFiltersChange: (filters: OrganizationFilters) => void;
    loading: boolean;
}

export const OrganizationFiltersComponent: React.FC<OrganizationFiltersProps> = ({
    filters,
    onFiltersChange,
    loading
}) => {
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({
            ...filters,
            status: e.target.value as 'all' | 'active' | 'inactive'
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            search: e.target.value
        });
    };

    const handleClearFilters = () => {
        onFiltersChange({
            status: 'all',
            search: ''
        });
    };

    const hasActiveFilters = filters.status !== 'all' || filters.search !== '';

    return (
        <Form>
            <Row className="g-3 align-items-end">
                <Col md={4}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                        value={filters.status}
                        onChange={handleStatusChange}
                        disabled={loading}
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Form.Select>
                </Col>

                <Col md={4}>
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Organization name or domain"
                        value={filters.search}
                        onChange={handleSearchChange}
                        disabled={loading}
                    />
                </Col>

                <Col md={4}>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-primary"
                            className="flex-fill"
                            disabled={loading}
                            onClick={() => onFiltersChange(filters)} // Trigger refresh
                        >
                            {loading ? 'Filtering...' : 'Filter'}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                variant="outline-secondary"
                                onClick={handleClearFilters}
                                disabled={loading}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
        </Form>
    );
};
