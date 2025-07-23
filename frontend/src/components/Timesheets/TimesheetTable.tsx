import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Timesheet, TimesheetStatus } from './types';
import { formatDate, getStatusColor } from './utils';
import './TimesheetTable.css';

const { Text } = Typography;

interface TimesheetTableProps {
  data: Timesheet[];
  loading: boolean;
  onEdit: (record: Timesheet) => void;
  onDelete: (id: string) => void;
  onChange: (pagination: any, filters: any, sorter: any) => void;
  pagination: any;
}

const TimesheetTable: React.FC<TimesheetTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onChange,
  pagination,
}) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Timesheet, b: Timesheet) => 
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => formatDate(date),
      width: 120,
    },
    {
      title: 'Project',
      dataIndex: 'project_name',
      key: 'project_name',
      sorter: (a: Timesheet, b: Timesheet) => 
        (a.project_name || '').localeCompare(b.project_name || ''),
      ellipsis: true,
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
      ellipsis: true,
      render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Hours',
      dataIndex: 'hours_worked',
      key: 'hours_worked',
      align: 'right' as const,
      width: 100,
      sorter: (a: Timesheet, b: Timesheet) => a.hours_worked - b.hours_worked,
      render: (hours: number) => hours.toFixed(2),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Draft', value: 'DRAFT' },
        { text: 'Submitted', value: 'SUBMITTED' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' },
      ],
      onFilter: (value: any, record: Timesheet) => record.status === value,
      render: (status: TimesheetStatus) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status.toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_: any, record: Timesheet) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)}
              disabled={record.status === 'APPROVED'}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(record.id)}
              disabled={record.status === 'APPROVED'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="timesheet-table">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onChange={onChange}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => 
          record.status === 'REJECTED' ? 'rejected-row' : ''
        }
      />
    </div>
  );
};

export default TimesheetTable;
