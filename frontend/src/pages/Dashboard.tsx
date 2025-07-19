import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/ui/StatCard';
import { Clock, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectAPI, timesheetAPI } from '@/services/api';

const Dashboard = () => {
  const { user } = useAuth();

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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}! Here's your overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hours Logged"
          value={totalHours.toFixed(2)}
          icon={Clock}
          description="Total hours from your timesheets."
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={Briefcase}
          description="Projects you are currently involved in."
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={AlertCircle}
          description="Timesheets waiting for approval."
        />
        <StatCard
          title="Approved Timesheets"
          value={approvedTimesheets}
          icon={CheckCircle}
          description="Your timesheets that have been approved."
        />
      </div>

      {/* More components like charts or recent activity will go here */}
    </div>
  );
};

export default Dashboard;