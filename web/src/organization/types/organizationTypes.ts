export interface OrganizationListItem {
    organizationId: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    userCount: number;
    activeUserCount: number;
}

export enum OrganizationStatus {
    All = 0,
    Active = 1,
    Inactive = 2,
}

export enum OrganizationSortBy {
    Name = 0,
    CreatedAt = 1,
    UserCount = 2,
    UpdatedAt = 3,
}

export enum SortDirection {
    Ascending = 0,
    Descending = 1,
}
