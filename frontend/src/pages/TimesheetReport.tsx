import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { timesheetAPI } from '../services/api';
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format, isSameDay, getMonth, getYear } from 'date-fns';
import { Download } from 'lucide-react';

const getMonthOptions = () => Array.from({ length: 12 }, (_, i) => i);
const getYearOptions = () => {
  const now = new Date();
  return [getYear(now) - 1, getYear(now), getYear(now) + 1];
};

const TimesheetReport: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(getMonth(now));
  const [selectedYear, setSelectedYear] = useState(getYear(now));
  const [selectedUser, setSelectedUser] = useState('');

  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).filter(d => !isWeekend(d));

  const { data, isLoading } = useQuery(['timesheets', 'all', monthStart], () => timesheetAPI.getTimesheets({
    start: monthStart.toISOString(),
    end: monthEnd.toISOString(),
    limit: 1000,
  }));
  const timesheets = data?.data?.data || [];

  // Get all users for filter
  const allUsers = Array.from(new Map(timesheets.map((t: any) => [t.user?.id, t.user])).values()).filter(Boolean);

  // Group by user
  const userMap: Record<string, any> = {};
  timesheets.forEach((t: any) => {
    if (selectedUser && t.user?.id !== selectedUser) return;
    const uid = t.user?.id || 'unknown';
    if (!userMap[uid]) {
      userMap[uid] = {
        user: t.user,
        days: {},
        totalMinutes: 0,
      };
    }
    const day = format(new Date(t.startTime), 'yyyy-MM-dd');
    userMap[uid].days[day] = (userMap[uid].days[day] || 0) + (t.duration || 0);
    userMap[uid].totalMinutes += t.duration || 0;
  });

  const users = Object.values(userMap);

  // Export CSV
  const csvHeaders = ['User', 'Email', 'Work Days', 'Checked-in Days', 'Missing Days', 'Missing Dates', 'Total Time'];
  const csvRows = users.map((u: any) => {
    const checkedInDays = daysInMonth.filter(day => u.days[format(day, 'yyyy-MM-dd')]);
    const missingDays = daysInMonth.filter(day => !u.days[format(day, 'yyyy-MM-dd')]);
    const totalMinutes = u.totalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return {
      'User': u.user?.name,
      'Email': u.user?.email,
      'Work Days': daysInMonth.length,
      'Checked-in Days': checkedInDays.length,
      'Missing Days': missingDays.length,
      'Missing Dates': missingDays.map(d => format(d, 'd MMM')).join(', ') || '-',
      'Total Time': `${hours}h ${minutes}m`,
    };
  });
  function toCSV(rows: any[]) {
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [
      csvHeaders.join(','),
      ...rows.map(row => csvHeaders.map(h => escape(row[h])).join(',')),
    ].join('\r\n');
  }
  const handleExport = () => {
    const csv = toCSV(csvRows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timesheet_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calendar visual
  function renderCalendar(u: any) {
    return (
      <div className="flex flex-wrap gap-1 text-xs">
        {daysInMonth.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const hasCheckin = u.days[key];
          return (
            <span
              key={key}
              className={`inline-block w-7 h-7 text-center rounded-full ${hasCheckin ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}
              title={format(day, 'd MMM yyyy') + (hasCheckin ? ' (checked-in)' : ' (missing)')}
            >
              {format(day, 'd')}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Timesheet Report (เดือน {format(monthStart, 'MMMM yyyy')})</h1>
        <button onClick={handleExport} className="btn btn-primary flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <select className="input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">All Users</option>
          {allUsers.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <select className="input" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {getMonthOptions().map(m => (
            <option key={m} value={m}>{format(new Date(2000, m), 'MMMM')}</option>
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
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Work Days</th>
                  <th className="px-4 py-2">Checked-in Days</th>
                  <th className="px-4 py-2">Missing Days</th>
                  <th className="px-4 py-2">Missing Dates</th>
                  <th className="px-4 py-2">Total Time</th>
                  <th className="px-4 py-2">Calendar</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u: any) => {
                  const checkedInDays = daysInMonth.filter(day => u.days[format(day, 'yyyy-MM-dd')]);
                  const missingDays = daysInMonth.filter(day => !u.days[format(day, 'yyyy-MM-dd')]);
                  const totalMinutes = u.totalMinutes;
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  return (
                    <tr key={u.user?.id}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{u.user?.name}</div>
                        <div className="text-xs text-gray-500">{u.user?.email}</div>
                      </td>
                      <td className="px-4 py-2 text-center">{daysInMonth.length}</td>
                      <td className="px-4 py-2 text-center">{checkedInDays.length}</td>
                      <td className="px-4 py-2 text-center">{missingDays.length}</td>
                      <td className="px-4 py-2 text-xs">{missingDays.map(d => format(d, 'd MMM')).join(', ') || '-'}</td>
                      <td className="px-4 py-2 text-center">{hours}h {minutes}m</td>
                      <td className="px-4 py-2">{renderCalendar(u)}</td>
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

export default TimesheetReport; 