/**
 * Common Types
 * 
 * Shared TypeScript interfaces and types used across the application.
 * These types are not specific to any particular module or feature.
 */

/**
 * Pagination information for paginated API responses and components
 */
export interface PaginationInfo {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of items across all pages */
    totalItems: number;
    /** Number of items per page */
    itemsPerPage: number;
}

/**
 * Standard API response wrapper
 * 
 * Provides a consistent structure for all API responses throughout the application
 * 
 * @template T The type of the data being returned
 */
export interface ApiResponse<T> {
    /** The actual data payload */
    data: T;
    /** Whether the request was successful */
    success: boolean;
    /** Optional message (error message, success message, etc.) */
    message?: string;
    /** Pagination information for paginated responses */
    pagination?: PaginationInfo;
}

/**
 * Common status types used across entities
 */
export type EntityStatus = 'Active' | 'Inactive';

/**
 * Base interface for entities with common fields
 */
export interface BaseEntity {
    id: string;
    createdDate: string;
    status: EntityStatus;
}
