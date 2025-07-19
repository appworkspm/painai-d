import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { CheckCircle, XCircle, AlertCircle, FolderOpen, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Timesheet, TimesheetWithApproval } from '../../types';

interface TimesheetItem extends Timesheet, Omit<TimesheetWithApproval, keyof Timesheet> {
  // Extending both Timesheet and TimesheetWithApproval interfaces
  activity?: string; // For backward compatibility
  created_at?: string; // For backward compatibility
  hours_worked?: number; // Already in TimesheetWithApproval but making it explicit
}

interface RecentActivityProps {
  timesheets: TimesheetItem[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ timesheets = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading your recent timesheet entries...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/20" />
            <p className="mt-2 text-sm text-muted-foreground">Loading activities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent timesheet entries</CardDescription>
      </CardHeader>
      <CardContent>
        {timesheets.length > 0 ? (
          <div className="space-y-4">
            {timesheets.slice(0, 5).map((timesheet) => (
              <TimesheetItemCard key={timesheet.id} timesheet={timesheet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/20" />
            <h3 className="mt-4 text-sm font-medium">No timesheets found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new timesheet entry.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/timesheets/new')}>
                New Timesheet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TimesheetItemCardProps {
  timesheet: TimesheetItem;
}

const TimesheetItemCard: React.FC<TimesheetItemCardProps> = ({ timesheet }) => {
  const statusIcons = {
    approved: <CheckCircle className="h-4 w-4 text-green-500 mr-2" />,
    rejected: <XCircle className="h-4 w-4 text-destructive mr-2" />,
    submitted: <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />,
    draft: <Clock className="h-4 w-4 text-gray-500 mr-2" />
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'submitted': return 'Pending Review';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const status = (timesheet.status?.toLowerCase() as keyof typeof statusIcons) || 'draft';
  const statusIcon = statusIcons[status] || null;
  const displayDate = timesheet.date || timesheet.createdAt?.split('T')[0] || 'No date';
  const hoursWorked = timesheet.hours_worked !== undefined ? timesheet.hours_worked : 'N/A';
  const activity = timesheet.activity || timesheet.description || 'No activity';
  const projectName = timesheet.project?.name || 'No Project';

  return (
    <div 
      className="flex items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{projectName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {displayDate}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {hoursWorked}h worked • {activity}
        </p>
      </div>
      <div className="flex items-center">
        {statusIcon}
        <span className="text-sm">{getStatusText(status)}</span>
      </div>
    </div>
  );
};

export default RecentActivity;
