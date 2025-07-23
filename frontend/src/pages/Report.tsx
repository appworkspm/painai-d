import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timesheetAPI } from '../services/api';
import { Download } from 'lucide-react';
import { getMonth, getYear, startOfMonth, endOfMonth, format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const getMonthOptions = () => Array.from({ length: 12 }, (_, i) => i);
const getYearOptions = () => {
  const now = new Date();
  return [getYear(now) - 1, getYear(now), getYear(now) + 1];
};

const csvHeaders = [
  'Project',
  'Work Type',
  'Activity',
  'Employee',
  'Role',
  'Hours',
];

function toCSV(rows: any[]) {
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    csvHeaders.join(','),
    ...rows.map(row => csvHeaders.map(h => escape(row[h])).join(',')),
  ].join('\r\n');
}

const WorkloadReport: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(getMonth(now));
  const [selectedYear, setSelectedYear] = useState(getYear(now));
  const [selectedUser, setSelectedUser] = useState('');
  const { t } = useTranslation();

  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const monthEnd = endOfMonth(monthStart);

  const { data, isLoading } = useQuery({
    queryKey: ['timesheets', 'all', monthStart],
    queryFn: () => timesheetAPI.getTimesheets({
      start: monthStart.toISOString(),
      end: monthEnd.toISOString(),
      limit: 1000,
    })
  });
  const timesheets = data?.data?.data || [];

  // Get all users for filter
  const allUsers = Array.from(new Map(timesheets.map((t: any) => [t.user?.id, t.user])).values()).filter(Boolean);

  // Filter by user
  const filteredTimesheets = selectedUser ? timesheets.filter((t: any) => t.user?.id === selectedUser) : timesheets;

  // Map timesheet data to CSV structure
  const csvRows = filteredTimesheets.map((t: any) => ({
    'Project': t.work_type === 'LEAVE' ? t('report.leave') : (t.project?.name || t('report.no_project')),
    'Work Type': t.work_type === 'LEAVE' ? t('report.leave') : (t.work_type === 'PROJECT' ? t('report.project') : t('report.non_project')),
    'Activity': t.description || '',
    'Employee': t.user?.name || '',
    'Role': t.user?.role || '',
    'Hours': t.duration ? Math.round((t.duration / 60) * 10) / 10 : '',
  }));

  const handleExport = () => {
    const csv = toCSV(csvRows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workload_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('report.title', { month: format(monthStart, 'MMMM yyyy') })}</h1>
        <button onClick={handleExport} className="btn btn-primary flex items-center">
          <Download className="h-4 w-4 mr-2" />
          {t('report.export_csv')}
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <select className="input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">{t('report.all_users')}</option>
          {allUsers.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <select className="input" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {getMonthOptions().map(m => (
            <option key={m} value={m}>{t('report.month', { month: format(new Date(2000, m), 'MMMM') })}</option>
          ))}
        </select>
        <select className="input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
          {getYearOptions().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="card">
        <div className="card-body overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {csvHeaders.map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t(`report.table.${h.replace(/ /g, '_').toLowerCase()}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvRows.map((row, i) => {
                  // Type assertion to ensure type safety
                  const typedRow = row as Record<string, string | number>;
                  return (
                    <tr key={i}>
                      {csvHeaders.map((h) => (
                        <td key={h} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typedRow[h]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkloadReport; 