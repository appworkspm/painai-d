import { useTranslation } from 'react-i18next';
import { Tag, TagProps } from 'antd';
import React from 'react';

type StatusType = 'project' | 'timesheet' | 'costRequest';

export const getStatusText = (type: StatusType, status: string): string => {
  const { t } = useTranslation();
  
  if (!status) return t('project.status.not_specified', 'ไม่ระบุ');
  
  const statusKey = status.toLowerCase();
  
  switch (type) {
    case 'project':
      return t(`project.status.${statusKey}`, status);
    case 'timesheet':
      return t(`timesheet.status.${statusKey}`, status);
    case 'costRequest':
      return t(`costRequest.status.${statusKey}`, status);
    default:
      return status;
  }
};

export const getStatusColor = (type: StatusType, status: string): TagProps['color'] => {
  if (!status) return 'default';
  
  const statusKey = status.toLowerCase();
  
  // Project status colors
  if (type === 'project') {
    switch (statusKey) {
      case 'active':
        return 'success';
      case 'completed':
        return 'blue';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  }
  
  // Timesheet status colors
  if (type === 'timesheet') {
    switch (statusKey) {
      case 'approved':
        return 'success';
      case 'submitted':
      case 'pending':
        return 'processing';
      case 'rejected':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  }
  
  // Cost Request status colors (same as timesheet for now)
  if (type === 'costRequest') {
    switch (statusKey) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'processing';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  }
  
  return 'default';
};

type StatusTagProps = {
  type: StatusType;
  status: string;
  className?: string;
};

export const StatusTag: React.FC<StatusTagProps> = ({ type, status, className }) => {
  const color = getStatusColor(type, status);
  const text = getStatusText(type, status);
  
  return React.createElement(Tag, { 
    color: color as TagProps['color'], 
    className: className 
  }, text);
};

export default {
  getStatusText,
  getStatusColor,
  StatusTag,
};
