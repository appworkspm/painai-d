import React, { useState, useCallback, useEffect } from 'react';
import { Button, Input, Select, DatePicker, Space, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { TimesheetStatus } from './types';
import dayjs from 'dayjs';
import './FiltersPanel.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FiltersPanelProps {
  filters: {
    status?: TimesheetStatus | 'ALL';
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    searchText?: string;
  };
  onStatusChange: (status: string) => void;
  onDateRangeChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => void;
  onSearch: (searchText: string) => void;
  onReset: () => void;
  onCreateNew: () => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PENDING', label: 'Pending' },
];

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onStatusChange,
  onDateRangeChange,
  onSearch,
  onReset,
  onCreateNew,
  loading = false,
}) => {
  const [searchValue, setSearchValue] = useState(filters.searchText || '');

  // Update local state when filters prop changes
  useEffect(() => {
    setSearchValue(filters.searchText || '');
  }, [filters.searchText]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = useCallback(() => {
    onSearch(searchValue);
  }, [onSearch, searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchValue('');
    onReset();
  };

  return (
    <div className="filters-panel">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6} lg={4}>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <Select
              value={filters.status || 'ALL'}
              onChange={onStatusChange}
              style={{ width: '100%' }}
              loading={loading}
              disabled={loading}
            >
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={10} lg={8}>
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <RangePicker
              value={filters.dateRange as [dayjs.Dayjs, dayjs.Dayjs]}
              onChange={onDateRangeChange}
              style={{ width: '100%' }}
              disabled={loading}
            />
          </div>
        </Col>

        <Col xs={24} sm={16} md={12} lg={8}>
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <Input
                              placeholder="ค้นหาตามงานหรือโครงการ..."
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onPressEnter={handleSearch}
              disabled={loading}
              allowClear
              suffix={
                <Button
                  type="text"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                />
              }
            />
          </div>
        </Col>

        <Col xs={24} sm={8} md={12} lg={4} className="actions-col">
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={loading}
              title="Reset filters"
            >
              Reset
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateNew}
              disabled={loading}
              className="new-entry-btn"
            >
              New Entry
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default FiltersPanel;
