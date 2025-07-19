import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI } from '@/services/api';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProjectForm } from '@/components/ProjectForm';
import { toast } from 'sonner';
import { Project } from '@/types';

const Projects = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectAPI.getProjects(),
  });

  const projects = projectsData?.data || [];

  const createProjectMutation = useMutation({
    mutationFn: projectAPI.createProject,
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectAPI.updateProject(id, data),
    onSuccess: () => {
      toast.success('Project updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: projectAPI.deleteProject,
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

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
      updateProjectMutation.mutate({ id: selectedProject.id, data: values });
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
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project: Project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.manager?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(project)}>
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(project)}
                        >
                          Delete Project
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
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
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