import { PaginationInfo, ApiResponse, EntityStatus, BaseEntity } from '../../common/types';

export interface Organization extends BaseEntity {
    name: string;
    domain: string;
    adminEmail: string;
    adminName: string;
    userCount?: number;
    caseCount?: number;
}

export interface OrganizationFormData {
    name: string;
    domain: string;
    adminEmail: string;
    adminName: string;
}

export interface OrganizationFilters {
    status: 'all' | 'active' | 'inactive';
    search: string;
}

export interface SuperUserState {
    organizations: Organization[];
    loading: boolean;
    error: string | null;
    filters: OrganizationFilters;
    pagination: PaginationInfo;
    selectedOrganization: Organization | null;
}
