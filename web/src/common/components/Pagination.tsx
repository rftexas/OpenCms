import React from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * Reusable Pagination Component
 * 
 * A shared pagination component that can be used across the application
 * for paginating large datasets like tables, lists, etc.
 * 
 * Features:
 * - Smart page number display with ellipsis for large page counts
 * - Previous/Next navigation
 * - Configurable disabled state
 * - Responsive design
 * - Bootstrap styling
 * 
 * @example
 * ```tsx
 * <PaginationComponent
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   disabled={loading}
 * />
 * ```
 */

interface PaginationProps {
    /** Current active page number (1-based) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback function called when page changes */
    onPageChange: (page: number) => void;
    /** Whether pagination controls should be disabled */
    disabled?: boolean;
}

export const PaginationComponent: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false
}) => {
    if (totalPages <= 1) {
        return null;
    }

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        // Calculate start and end page numbers
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page and ellipsis
        if (startPage > 1) {
            items.push(
                <Pagination.Item
                    key={1}
                    active={currentPage === 1}
                    onClick={() => !disabled && onPageChange(1)}
                    disabled={disabled}
                >
                    1
                </Pagination.Item>
            );

            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" disabled={disabled} />);
            }
        }

        // Page numbers
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item
                    key={page}
                    active={currentPage === page}
                    onClick={() => !disabled && onPageChange(page)}
                    disabled={disabled}
                >
                    {page}
                </Pagination.Item>
            );
        }

        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" disabled={disabled} />);
            }

            items.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => !disabled && onPageChange(totalPages)}
                    disabled={disabled}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

    return (
        <div className="d-flex justify-content-center">
            <Pagination>
                <Pagination.Prev
                    onClick={() => !disabled && currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={disabled || currentPage === 1}
                />

                {renderPaginationItems()}

                <Pagination.Next
                    onClick={() => !disabled && currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={disabled || currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
};
