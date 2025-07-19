import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PaginationProps = {
  /**
   * The current page number (1-based index)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Number of items per page
   */
  pageSize: number;
  /**
   * Total number of items across all pages
   */
  totalItems: number;
  /**
   * Callback when the page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Callback when the page size changes
   */
  onPageSizeChange?: (size: number) => void;
  /**
   * Available page sizes
   * @default [10, 20, 30, 50, 100]
   */
  pageSizeOptions?: number[];
  /**
   * Whether to show the page size selector
   * @default true
   */
  showPageSizeSelector?: boolean;
  /**
   * Whether to show the total items count
   * @default true
   */
  showTotalItems?: boolean;
  /**
   * Custom class name for the pagination container
   */
  className?: string;
};

/**
 * A pagination component for navigating through pages of data
 */
function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeSelector = true,
  showTotalItems = true,
  className,
}: PaginationProps) {
  // Don't render if there's only one page and we're not showing page size options
  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of the middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 3) {
        endPage = 3;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 2;
      }

      // Add ellipsis if needed after first page
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed before last page
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 px-2', className)}>
      {showTotalItems && (
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}
      
      <div className="flex items-center space-x-1">
        <PaginationButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </PaginationButton>

        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <PaginationButton
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              isActive={currentPage === page}
              aria-label={`Page ${page}${currentPage === page ? ', current page' : ''}`}
            >
              {page}
            </PaginationButton>
          )
        )}

        <PaginationButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </PaginationButton>
      </div>

      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

type PaginationButtonProps = ButtonProps & {
  isActive?: boolean;
};

/**
 * A styled button for pagination controls
 */
const PaginationButton = ({
  className,
  isActive,
  variant = 'outline',
  size = 'sm',
  ...props
}: PaginationButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'h-9 w-9 p-0',
        isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      {...props}
    />
  );
};

export { Pagination };
