import { useState, useEffect, useCallback } from 'react';
import { PaginationInfo, ApiResponse } from '../../common/types';
import { Organization, OrganizationFormData, OrganizationFilters } from '../types';

// Mock API service - replace with actual API calls
class OrganizationService {
    private static mockOrganizations: Organization[] = [
        {
            id: '1',
            name: 'ACME Corporation',
            domain: 'acme.com',
            status: 'Active',
            createdDate: '2024-01-10',
            adminEmail: 'alex@acme.com',
            adminName: 'Alex Admin',
            userCount: 45,
            caseCount: 124
        },
        {
            id: '2',
            name: 'Global Tech Solutions',
            domain: 'globaltech.com',
            status: 'Active',
            createdDate: '2024-02-03',
            adminEmail: 'jane@globaltech.com',
            adminName: 'Jane Smith',
            userCount: 32,
            caseCount: 89
        },
        {
            id: '3',
            name: 'Healthcare United',
            domain: 'healthcare.com',
            status: 'Inactive',
            createdDate: '2023-12-15',
            adminEmail: 'admin@healthcare.com',
            adminName: 'Dr. Johnson',
            userCount: 28,
            caseCount: 67
        }
    ];

    static async getOrganizations(filters: OrganizationFilters, page: number = 1, limit: number = 10): Promise<ApiResponse<Organization[]>> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filtered = [...this.mockOrganizations];

        // Apply filters
        if (filters.status !== 'all') {
            filtered = filtered.filter(org =>
                org.status.toLowerCase() === filters.status
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(org =>
                org.name.toLowerCase().includes(searchTerm) ||
                org.domain.toLowerCase().includes(searchTerm) ||
                org.adminEmail.toLowerCase().includes(searchTerm)
            );
        }

        // Apply pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const paginatedData = filtered.slice(startIndex, startIndex + limit);

        return {
            data: paginatedData,
            success: true,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit
            }
        };
    }

    static async createOrganization(orgData: OrganizationFormData): Promise<ApiResponse<Organization>> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for duplicate domain
        const existingOrg = this.mockOrganizations.find(org => org.domain === orgData.domain);
        if (existingOrg) {
            return {
                data: {} as Organization,
                success: false,
                message: 'Domain already exists'
            };
        }

        const newOrg: Organization = {
            id: Date.now().toString(),
            ...orgData,
            status: 'Active',
            createdDate: new Date().toISOString().split('T')[0],
            userCount: 0,
            caseCount: 0
        };

        this.mockOrganizations.push(newOrg);

        return {
            data: newOrg,
            success: true,
            message: 'Organization created successfully'
        };
    }

    static async updateOrganization(id: string, orgData: Partial<OrganizationFormData>): Promise<ApiResponse<Organization>> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const orgIndex = this.mockOrganizations.findIndex(org => org.id === id);
        if (orgIndex === -1) {
            return {
                data: {} as Organization,
                success: false,
                message: 'Organization not found'
            };
        }

        this.mockOrganizations[orgIndex] = {
            ...this.mockOrganizations[orgIndex],
            ...orgData
        };

        return {
            data: this.mockOrganizations[orgIndex],
            success: true,
            message: 'Organization updated successfully'
        };
    }

    static async deactivateOrganization(id: string): Promise<ApiResponse<Organization>> {
        await new Promise(resolve => setTimeout(resolve, 600));

        const orgIndex = this.mockOrganizations.findIndex(org => org.id === id);
        if (orgIndex === -1) {
            return {
                data: {} as Organization,
                success: false,
                message: 'Organization not found'
            };
        }

        this.mockOrganizations[orgIndex].status = 'Inactive';

        return {
            data: this.mockOrganizations[orgIndex],
            success: true,
            message: 'Organization deactivated successfully'
        };
    }
}

export const useOrganizations = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const fetchOrganizations = useCallback(async (filters: OrganizationFilters, page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await OrganizationService.getOrganizations(filters, page);

            if (response.success) {
                setOrganizations(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                setError(response.message || 'Failed to fetch organizations');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrganization = useCallback(async (orgData: OrganizationFormData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await OrganizationService.createOrganization(orgData);

            if (response.success) {
                // Refresh the organizations list
                return { success: true, message: response.message };
            } else {
                setError(response.message || 'Failed to create organization');
                return { success: false, message: response.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to create organization';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrganization = useCallback(async (id: string, orgData: Partial<OrganizationFormData>) => {
        setLoading(true);
        setError(null);

        try {
            const response = await OrganizationService.updateOrganization(id, orgData);

            if (response.success) {
                // Update the local state
                setOrganizations(prev =>
                    prev.map(org => org.id === id ? response.data : org)
                );
                return { success: true, message: response.message };
            } else {
                setError(response.message || 'Failed to update organization');
                return { success: false, message: response.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to update organization';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateOrganization = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await OrganizationService.deactivateOrganization(id);

            if (response.success) {
                // Update the local state
                setOrganizations(prev =>
                    prev.map(org => org.id === id ? response.data : org)
                );
                return { success: true, message: response.message };
            } else {
                setError(response.message || 'Failed to deactivate organization');
                return { success: false, message: response.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to deactivate organization';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        organizations,
        loading,
        error,
        pagination,
        fetchOrganizations,
        createOrganization,
        updateOrganization,
        deactivateOrganization
    };
};
