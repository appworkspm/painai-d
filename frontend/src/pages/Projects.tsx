import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, AlertCircle, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProjectForm } from '@/components/ProjectForm';
import { toast } from 'sonner';
import { Project } from '@/types';

const Projects = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Fetch projects data with error handling and loading states
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await projectAPI.getProjects();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch projects');
      } catch (err) {
        console.error('Error fetching projects:', err);
        toast.error('Failed to load projects. Please try again.');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle project creation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id'>) => {
      const response = await projectAPI.createProject(projectData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create project');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    },
  });

  // Handle project update
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: string; projectData: Partial<Project> }) => {
      const response = await projectAPI.updateProject(data.id, data.projectData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update project');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    },
  });

  // Handle project deletion
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await projectAPI.deleteProject(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete project');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    },
  });


  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">Failed to load projects</p>
        <Button onClick={() => queryClient.refetchQueries({ queryKey: ['projects'] })}>
          Retry
        </Button>
      </div>
    );
  }


  // Show empty state
  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">No projects found</p>
        <p className="text-muted-foreground">Get started by creating a new project</p>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    );
  }

  const projects = projectsData || [];


  const handleAddClick = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    if (selectedProject) {
      updateProjectMutation.mutate({ id: selectedProject.id, projectData: values });
    } else {
      createProjectMutation.mutate(values);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'ON_HOLD': return 'warning';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('project_details.projects_title')}</h1>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('project_details.add_project')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('project_details.project_name_column')}</TableHead>
              <TableHead>{t('project_details.job_code_column')}</TableHead>
              <TableHead>{t('project_details.status_column')}</TableHead>
              <TableHead>{t('project_details.manager_column')}</TableHead>
              <TableHead>{t('project_details.start_date_column')}</TableHead>
              <TableHead>{t('project_details.end_date_column')}</TableHead>
              <TableHead className="text-right">{t('project_details.actions_column')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project: Project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.jobCode || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.manager?.name || 'N/A'}</TableCell>
                  <TableCell>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('project_details.actions_column')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(project)}>
                          {t('project_details.edit_project_action')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(project)}
                        >
                          {t('project_details.delete_project_action')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProject ? t('project_details.edit_project') : t('project_details.add_new_project')}</DialogTitle>
            <DialogDescription>
              {selectedProject ? 'Update the details of your project.' : 'Fill in the form to create a new project.'}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleFormSubmit}
            initialData={selectedProject}
            isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{selectedProject?.name}" and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProject(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProject) {
                  deleteProjectMutation.mutate(selectedProject.id);
                }
              }}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;