import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { DatePicker } from './date-picker';
import { Filter, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ReportFiltersProps {
  filters: {
    dateRange?: { start: Date | null; end: Date | null };
    status?: string;
    project?: string;
    user?: string;
    workType?: string;
    category?: string;
    activity?: string;
    action?: string;
    department?: string;
    [key: string]: any;
  };
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  options?: {
    status?: FilterOption[];
    projects?: FilterOption[];
    users?: FilterOption[];
    workTypes?: FilterOption[];
    categories?: FilterOption[];
    activities?: FilterOption[];
    actions?: FilterOption[];
    departments?: FilterOption[];
  };
  showDateRange?: boolean;
  showStatus?: boolean;
  showProject?: boolean;
  showUser?: boolean;
  showWorkType?: boolean;
  showCategory?: boolean;
  showActivity?: boolean;
  showAction?: boolean;
  showDepartment?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
  collapsible?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  options = {},
  showDateRange = true,
  showStatus = true,
  showProject = true,
  showUser = true,
  showWorkType = true,
  showCategory = false,
  showActivity = false,
  showAction = false,
  showDepartment = false,
  className,
  variant = 'default',
  collapsible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        if (key === 'dateRange') {
          if (value.start || value.end) count++;
        } else {
          count++;
        }
      }
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getVariantStyle = () => {
    switch (variant) {
      case 'compact': return 'space-y-3';
      case 'expanded': return 'space-y-6';
      default: return 'space-y-4';
    }
  };

  const getGridCols = () => {
    switch (variant) {
      case 'compact': return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'expanded': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const FilterField = ({ 
    label, 
    children, 
    show = true 
  }: { 
    label: string; 
    children: React.ReactNode; 
    show?: boolean;
  }) => {
    if (!show) return null;
    
    return (
      <div className={cn(
        'space-y-2',
        variant === 'compact' ? 'space-y-1' : 'space-y-2'
      )}>
        <Label className={cn(
          'text-sm font-medium text-gray-700 dark:text-gray-300',
          variant === 'compact' ? 'text-xs' : 'text-sm'
        )}>
          {label}
        </Label>
        {children}
      </div>
    );
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className={cn(getVariantStyle())}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}>
              ตัวกรอง
            </span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size={variant === 'compact' ? 'sm' : 'default'}
                onClick={onReset}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                รีเซ็ต
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size={variant === 'compact' ? 'sm' : 'default'}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className={cn('grid gap-4', getGridCols())}>
            {showDateRange && (
              <FilterField label="ช่วงวันที่">
                <div className="flex gap-2">
                  <DatePicker
                    selected={filters.dateRange?.start}
                    onChange={(date) => onFilterChange('dateRange', { 
                      ...filters.dateRange, 
                      start: date 
                    })}
                    placeholderText="วันที่เริ่มต้น"
                    className="flex-1 text-sm"
                  />
                  <DatePicker
                    selected={filters.dateRange?.end}
                    onChange={(date) => onFilterChange('dateRange', { 
                      ...filters.dateRange, 
                      end: date 
                    })}
                    placeholderText="วันที่สิ้นสุด"
                    className="flex-1 text-sm"
                  />
                </div>
              </FilterField>
            )}

            {showStatus && options.status && (
              <FilterField label="สถานะ">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => onFilterChange('status', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.status.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showProject && options.projects && (
              <FilterField label="โครงการ">
                <Select
                  value={filters.project || 'all'}
                  onValueChange={(value) => onFilterChange('project', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.projects.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showUser && options.users && (
              <FilterField label="ผู้ใช้">
                <Select
                  value={filters.user || 'all'}
                  onValueChange={(value) => onFilterChange('user', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกผู้ใช้" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.users.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showWorkType && options.workTypes && (
              <FilterField label="ประเภทงาน">
                <Select
                  value={filters.workType || 'all'}
                  onValueChange={(value) => onFilterChange('workType', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกประเภทงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.workTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showActivity && options.activities && (
              <FilterField label="กิจกรรม">
                <Select
                  value={filters.activity || 'all'}
                  onValueChange={(value) => onFilterChange('activity', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกกิจกรรม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.activities.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showAction && options.actions && (
              <FilterField label="การดำเนินการ">
                <Select
                  value={filters.action || 'all'}
                  onValueChange={(value) => onFilterChange('action', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกการดำเนินการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.actions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showCategory && options.categories && (
              <FilterField label="หมวดหมู่">
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => onFilterChange('category', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.categories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}

            {showDepartment && options.departments && (
              <FilterField label="แผนก">
                <Select
                  value={filters.department || 'all'}
                  onValueChange={(value) => onFilterChange('department', value)}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="เลือกแผนก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {options.departments.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              {option.count}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 