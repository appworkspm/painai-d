import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/ui/StatCard';
import { Clock, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectAPI, timesheetAPI } from '@/services/api';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  // Fetch user's timesheets
  const { data: timesheetsData } = useQuery({
    queryKey: ['my-timesheets'],
    queryFn: () => timesheetAPI.getMyTimesheets(),
    enabled: !!user, // Only run if user is available
  });

  const projects = projectsData?.data || [];
  const timesheets = timesheetsData?.data?.data || [];

  // --- Calculations ---
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;

  const totalHours = timesheets.reduce((acc: number, ts: any) => {
    const hours = parseFloat(ts.hours_worked) || 0;
    const overtime = parseFloat(ts.overtime_hours) || 0;
    return acc + hours + overtime;
  }, 0);

  const pendingApprovals = timesheets.filter((ts: any) => ts.status === 'draft' || ts.status === 'submitted').length;
  const approvedTimesheets = timesheets.filter((ts: any) => ts.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome', { name: user?.name })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.total_hours')}
          value={totalHours.toFixed(2)}
          icon={Clock}
          description={t('dashboard.total_hours_desc')}
        />
        <StatCard
          title={t('dashboard.active_projects')}
          value={activeProjects}
          icon={Briefcase}
          description={t('dashboard.active_projects_desc')}
        />
        <StatCard
          title={t('dashboard.pending_approvals')}
          value={pendingApprovals}
          icon={AlertCircle}
          description={t('dashboard.pending_approvals_desc')}
        />
        <StatCard
          title={t('dashboard.approved_timesheets')}
          value={approvedTimesheets}
          icon={CheckCircle}
          description={t('dashboard.approved_timesheets_desc')}
        />
      </div>

      {/* More components like charts or recent activity will go here */}
    </div>
  );
};

export default Dashboard;