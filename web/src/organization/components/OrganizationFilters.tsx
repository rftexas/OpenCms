import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { OrganizationSortBy, OrganizationStatus, SortDirection } from '../types/organizationTypes';

interface OrganizationFiltersProps {
    searchTerm: string;
    onSearch: (term: string) => void;
    status?: OrganizationStatus;
    onStatusChange: (status: OrganizationStatus | undefined) => void;
    sortBy: OrganizationSortBy;
    sortDirection: SortDirection;
    onSortChange: (sortBy: OrganizationSortBy, sortDirection: SortDirection) => void;
}

const OrganizationFilters: React.FC<OrganizationFiltersProps> = ({
    searchTerm,
    onSearch,
    status,
    onStatusChange,
    sortBy,
    sortDirection,
    onSortChange,
}) => {
    return (
        <Form className="mb-3">
            <Row>
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Search by name or description"
                        value={searchTerm}
                        onChange={e => onSearch(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={status !== undefined ? status : ''}
                        onChange={e => onStatusChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    >
                        <option value="">All Statuses</option>
                        <option value={OrganizationStatus.Active}>Active</option>
                        <option value={OrganizationStatus.Inactive}>Inactive</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortBy}
                        onChange={e => onSortChange(Number(e.target.value), sortDirection)}
                    >
                        <option value={OrganizationSortBy.Name}>Name</option>
                        <option value={OrganizationSortBy.CreatedAt}>Created At</option>
                        <option value={OrganizationSortBy.UserCount}>User Count</option>
                        <option value={OrganizationSortBy.UpdatedAt}>Updated At</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select
                        value={sortDirection}
                        onChange={e => onSortChange(sortBy, Number(e.target.value))}
                    >
                        <option value={SortDirection.Ascending}>Ascending</option>
                        <option value={SortDirection.Descending}>Descending</option>
                    </Form.Select>
                </Col>
            </Row>
        </Form>
    );
};

export default OrganizationFilters;
