import { Dayjs } from 'dayjs';
import { TablePaginationConfig } from 'antd';

export interface Timesheet {
  id: string;
  date: string;
  project_id: string;
  project_name?: string;
  task: string;
  hours_worked: number;
  status: TimesheetStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  client_name?: string;
}

export type TimesheetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PENDING';

export interface TimesheetFormValues {
  id?: string;
  date: Dayjs;
  project_id: string;
  task: string;
  hours_worked: number;
  notes?: string;
  status?: TimesheetStatus;
}

export interface TimesheetStats {
  totalHours: number;
  thisWeekHours: number;
  approved: number;
  pending: number;
}

export interface TimesheetFilters {
  status?: TimesheetStatus | 'ALL';
  dateRange?: [Dayjs, Dayjs];
  searchText?: string;
}

export interface TimesheetsState {
  timesheets: Timesheet[];
  projects: Project[];
  loading: boolean;
  submitting: boolean;
  isModalVisible: boolean;
  editingTimesheet: Timesheet | null;
  stats: TimesheetStats;
  filters: TimesheetFilters;
  pagination: TablePaginationConfig;
}

export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    transition: {
      duration?: number;
      staggerChildren?: number;
    };
  };
}

export interface TimesheetTableProps {
  timesheets: Timesheet[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onEdit: (record: Timesheet) => void;
  onDelete: (id: string) => void;
  onTableChange: (pagination: TablePaginationConfig) => void;
}

export interface TimesheetFormProps {
  visible: boolean;
  initialValues?: Partial<TimesheetFormValues>;
  loading: boolean;
  projects: Project[];
  onSubmit: (values: TimesheetFormValues) => Promise<void>;
  onCancel: () => void;
}

export interface StatsPanelProps {
  stats: TimesheetStats;
  loading: boolean;
}

export interface FiltersPanelProps {
  filters: TimesheetFilters;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onSearch: (searchText: string) => void;
  onCreateNew: () => void;
}
