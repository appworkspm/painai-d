import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalHours: number;
    overtimeHours: number;
    pendingApprovals: number;
    completed: number;
    rejected: number;
  };
  timeRange: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, timeRange }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Hours"
        value={stats.totalHours.toString()}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        description={`+20.1% from last ${timeRange}`}
      />
      
      <StatCard
        title="Overtime"
        value={stats.overtimeHours.toString()}
        icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        description={`+12.3% from last ${timeRange}`}
      />
      
      <StatCard
        title="Pending Approval"
        value={stats.pendingApprovals.toString()}
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        description={stats.pendingApprovals > 0 ? 'Needs your attention' : 'All caught up!'}
      />
      
      <StatCard
        title="Completed"
        value={stats.completed.toString()}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        description={stats.rejected > 0 ? `${stats.rejected} rejected` : 'All approved'}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default DashboardStats;
