import { Dayjs } from 'dayjs';
import { Timesheet, TimesheetStatus } from './types';

// Format date to YYYY-MM-DD
export const formatDate = (date: Dayjs | string | null | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
  return date.format('YYYY-MM-DD');
};

// Calculate total hours from timesheets
export const calculateTotalHours = (timesheets: Timesheet[]): number => {
  return timesheets.reduce((sum, ts) => sum + (ts.hours_worked || 0), 0);
};

// Filter timesheets by date range
export const filterTimesheetsByDateRange = (
  timesheets: Timesheet[], 
  startDate: Dayjs | null, 
  endDate: Dayjs | null
): Timesheet[] => {
  if (!startDate || !endDate) return timesheets;
  
  return timesheets.filter(timesheet => {
    const date = dayjs(timesheet.date);
    return date.isAfter(startDate.startOf('day')) && date.isBefore(endDate.endOf('day'));
  });
};

// Get status badge color
export const getStatusColor = (status: TimesheetStatus): string => {
  switch (status) {
    case 'APPROVED':
      return 'green';
    case 'SUBMITTED':
    case 'PENDING':
      return 'blue';
    case 'REJECTED':
      return 'red';
    case 'DRAFT':
    default:
      return 'default';
  }
};

// Format hours to 2 decimal places
export const formatHours = (hours: number): string => {
  return hours.toFixed(2);
};

// Initial form values
export const getInitialFormValues = (): TimesheetFormValues => ({
  date: dayjs(),
  project_id: '',
  task: '',
  hours_worked: 0,
  notes: '',
});

// Map API response to form values
export const mapToFormValues = (timesheet: Timesheet): TimesheetFormValues => ({
  id: timesheet.id,
  date: dayjs(timesheet.date),
  project_id: timesheet.project_id,
  task: timesheet.task,
  hours_worked: timesheet.hours_worked,
  notes: timesheet.notes || '',
  status: timesheet.status,
});

// Animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
