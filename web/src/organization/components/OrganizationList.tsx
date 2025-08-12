import React, { useEffect, useState } from "react";
import { Badge, Pagination, Spinner, Table } from "react-bootstrap";
import { OrganizationListItem, OrganizationSortBy, OrganizationStatus, SortDirection } from "../types/organizationTypes";
import OrganizationFilters from "./OrganizationFilters";

interface OrganizationListProps {
    isSuperUser: boolean;
}

const PAGE_SIZE = 10;

const OrganizationList: React.FC<OrganizationListProps> = ({ isSuperUser }) => {
    const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<OrganizationStatus | undefined>(undefined);
    const [sortBy, setSortBy] = useState<OrganizationSortBy>(OrganizationSortBy.Name);
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Ascending);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchOrganizations();
        // eslint-disable-next-line
    }, [searchTerm, status, sortBy, sortDirection, page]);

    const fetchOrganizations = async () => {
        setLoading(true);
        const params = new URLSearchParams({
            searchTerm,
            status: status !== undefined ? status.toString() : "",
            page: page.toString(),
            pageSize: PAGE_SIZE.toString(),
            sortBy: sortBy.toString(),
            sortDirection: sortDirection.toString(),
        });
        const res = await fetch(`/api/organizations?${params}`);
        if (res.ok) {
            const data = await res.json();
            setOrganizations(data.organizations);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        }
        setLoading(false);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleStatusChange = (newStatus: OrganizationStatus | undefined) => {
        setStatus(newStatus);
        setPage(1);
    };

    const handleSortChange = (newSortBy: OrganizationSortBy, newSortDirection: SortDirection) => {
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        setPage(1);
    };

    return (
        <div>
            <h2>Organizations</h2>
            <OrganizationFilters
                searchTerm={searchTerm}
                onSearch={handleSearch}
                status={status}
                onStatusChange={handleStatusChange}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            />
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>User Count</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.organizationId}>
                                    <td>{org.name}</td>
                                    <td>{org.description}</td>
                                    <td>
                                        {org.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}
                                    </td>
                                    <td>{org.userCount}</td>
                                    <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                                    <td>{org.updatedAt ? new Date(org.updatedAt).toLocaleDateString() : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                        <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
                        {[...Array(totalPages)].map((_, idx) => (
                            <Pagination.Item key={idx + 1} active={page === idx + 1} onClick={() => setPage(idx + 1)}>
                                {idx + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
                        <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                    <div className="mt-2">Total Organizations: {totalCount}</div>
                </>
            )}
        </div>
    );
};

export default OrganizationList;
