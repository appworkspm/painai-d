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
      // Convert date strings to Date objects before sending to API
      const formattedData = {
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
        endDate: projectData.endDate ? new Date(projectData.endDate) : undefined
      };
      const response = await projectAPI.createProject(formattedData);
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
    mutationFn: async (data: { id: string; projectData: Partial<Omit<Project, 'startDate' | 'endDate'>> & { startDate?: Date; endDate?: Date } }) => {
      // The dates are already converted to Date objects in the form submission
      const formattedData = { ...data.projectData };
      const response = await projectAPI.updateProject(data.id, formattedData);
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

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">{t('project_details.actions_column')}</TableHead>
                <TableHead className="min-w-[200px]">{t('project_details.project_name_column')}</TableHead>
                <TableHead className="min-w-[120px]">{t('project_details.job_code_column')}</TableHead>
                <TableHead className="min-w-[100px]">{t('project_details.status_column')}</TableHead>
                <TableHead className="min-w-[150px]">{t('project_details.manager_column')}</TableHead>
                <TableHead className="min-w-[100px]">{t('project_details.start_date_column')}</TableHead>
                <TableHead className="min-w-[100px]">{t('project_details.end_date_column')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
                      กำลังโหลด...
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    ไม่พบโครงการ
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project: Project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">เปิดเมนู</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel className="text-xs font-medium">จัดการโครงการ</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(project)} className="text-sm">
                            <FolderOpen className="mr-2 h-4 w-4" />
                            {t('project_details.edit_project_action')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 text-sm"
                            onClick={() => handleDeleteClick(project)}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            {t('project_details.delete_project_action')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={project.name}>
                      {project.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.jobCode || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status) as 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined} className="text-xs">
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[150px] truncate" title={project.manager?.name || 'N/A'}>
                      {project.manager?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('th-TH') : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('th-TH') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedProject ? t('project_details.edit_project') : t('project_details.add_new_project')}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {selectedProject ? 'แก้ไขข้อมูลโครงการของคุณ' : 'กรอกข้อมูลเพื่อสร้างโครงการใหม่'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              onSubmit={handleFormSubmit}
              initialData={selectedProject}
              isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">ยืนยันการลบโครงการ</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              การดำเนินการนี้ไม่สามารถยกเลิกได้ โครงการ "{selectedProject?.name}" และข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProject(null)} className="text-sm">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProject) {
                  deleteProjectMutation.mutate(selectedProject.id);
                }
              }}
              disabled={deleteProjectMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-sm"
            >
              {deleteProjectMutation.isPending ? 'กำลังลบ...' : 'ลบโครงการ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Projects;