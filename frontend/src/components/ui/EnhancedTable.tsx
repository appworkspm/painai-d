import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface EnhancedTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  variant?: 'default' | 'compact' | 'bordered';
  striped?: boolean;
  hoverable?: boolean;
}

export const EnhancedTable: React.FC<EnhancedTableProps> = ({
  columns,
  data,
  loading = false,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className,
  emptyMessage = 'ไม่มีข้อมูล',
  onRowClick,
  onSort,
  variant = 'default',
  striped = true,
  hoverable = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'th')
          : bValue.localeCompare(aValue, 'th');
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }, [data, sortKey, sortDirection, sortable]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'compact': return 'text-sm';
      case 'bordered': return 'border border-gray-200 dark:border-gray-700';
      default: return '';
    }
  };

  const getTableStyle = () => {
    const baseStyle = 'w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden';
    return cn(baseStyle, getVariantStyle(), className);
  };

  const getHeaderStyle = () => {
    const baseStyle = 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium';
    return cn(baseStyle, variant === 'compact' ? 'text-xs' : 'text-sm');
  };

  const getRowStyle = (index: number) => {
    const baseStyle = 'transition-colors duration-150';
    const stripedStyle = striped && index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-700/50' : '';
    const hoverStyle = hoverable ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : '';
    const clickableStyle = onRowClick ? 'cursor-pointer' : '';
    
    return cn(baseStyle, stripedStyle, hoverStyle, clickableStyle);
  };

  const renderCell = (column: Column, row: any, index: number) => {
    const value = row[column.key];
    const cellContent = column.render ? column.render(value, row) : value;
    
    return (
      <td
        key={column.key}
        className={cn(
          'px-4 py-3 text-gray-900 dark:text-gray-100',
          variant === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3',
          column.align === 'center' && 'text-center',
          column.align === 'right' && 'text-right',
          column.className
        )}
        style={{ width: column.width }}
      >
        {cellContent}
      </td>
    );
  };

  const renderSortIcon = (column: Column) => {
    if (!column.sortable || !sortable) return null;

    if (sortKey === column.key) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1" />
      );
    }

    return <MoreHorizontal className="h-4 w-4 ml-1 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className={getTableStyle()}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={getTableStyle()}>
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    getHeaderStyle(),
                    'px-4 py-3 text-left',
                    variant === 'compact' ? 'px-3 py-2' : 'px-4 py-3',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={cn(
                    'flex items-center',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    <span>{column.label}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={getRowStyle(index)}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => renderCell(column, row, index))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            แสดง {((currentPage - 1) * pageSize) + 1} ถึง {Math.min(currentPage * pageSize, sortedData.length)} จาก {sortedData.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrent = page === currentPage;
              const isNearCurrent = Math.abs(page - currentPage) <= 1;
              const isFirst = page === 1;
              const isLast = page === totalPages;
              
              if (isCurrent || isNearCurrent || isFirst || isLast) {
                return (
                  <Button
                    key={page}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              }
              
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 