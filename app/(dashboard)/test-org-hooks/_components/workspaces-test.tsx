/**
 * Organization Workspaces Test Component
 *
 * This component demonstrates the usage of organization workspaces hooks
 * and provides a UI for testing them.
 *
 * @module app/(dashboard)/test-org-hooks/components/workspaces-test
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateWorkspace,
  type CreateWorkspaceInput,
} from '@/lib/hooks/org/use-create-workspace';
import type { PaginationOptions } from '@/lib/hooks/org/use-org-activity';
import {
  useOrgWorkspace,
  useOrgWorkspaces,
} from '@/lib/hooks/org/use-org-workspaces';
import {
  useUpdateWorkspace,
  type UpdateWorkspaceInput,
} from '@/lib/hooks/org/use-update-workspace';

/**
 * Form schema for organization ID input
 */
const orgIdSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
});

/**
 * Form schema for workspace ID input
 */
const workspaceIdSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

/**
 * Form schema for creating a workspace
 */
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  metadata: z.string().optional(),
});

/**
 * Form schema for updating a workspace
 */
const updateWorkspaceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  metadata: z.string().optional(),
});

/**
 * Organization Workspaces Test Section
 *
 * This component provides a UI for testing the organization workspaces hooks.
 * It allows fetching workspaces for a specific organization, creating new workspaces,
 * and updating existing workspaces.
 */
export function WorkspacesTestSection() {
  const [orgId, setOrgId] = useState<string>('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>(
    {
      limit: 10,
      page: 1,
    }
  );

  // Forms
  const orgIdForm = useForm<z.infer<typeof orgIdSchema>>({
    resolver: zodResolver(orgIdSchema),
    defaultValues: {
      orgId: '',
    },
  });

  const workspaceIdForm = useForm<z.infer<typeof workspaceIdSchema>>({
    resolver: zodResolver(workspaceIdSchema),
    defaultValues: {
      workspaceId: '',
    },
  });

  const createWorkspaceForm = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      metadata: '',
    },
  });

  const updateWorkspaceForm = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      metadata: '',
    },
  });

  // Queries and mutations
  const {
    data: workspaces,
    isLoading: isLoadingWorkspaces,
    error: workspacesError,
    refetch: refetchWorkspaces,
  } = useOrgWorkspaces(orgId, paginationOptions);

  const {
    data: selectedWorkspace,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useOrgWorkspace(selectedWorkspaceId);

  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();

  // Handle organization ID form submission
  const onOrgIdSubmit = (values: z.infer<typeof orgIdSchema>) => {
    setOrgId(values.orgId);
    toast.info('Fetching workspaces', {
      description: `Fetching workspaces for organization: ${values.orgId}`,
    });
  };

  // Handle workspace ID form submission
  const onWorkspaceIdSubmit = (values: z.infer<typeof workspaceIdSchema>) => {
    setSelectedWorkspaceId(values.workspaceId);
    toast.info('Fetching workspace', {
      description: `Fetching workspace: ${values.workspaceId}`,
    });
  };

  // Handle create workspace form submission
  const onCreateWorkspaceSubmit = (
    values: z.infer<typeof createWorkspaceSchema>
  ) => {
    if (!orgId) {
      toast.error('Error', {
        description: 'Please enter an organization ID first',
      });
      return;
    }

    let metadata: Record<string, unknown> | undefined;

    if (values.metadata) {
      try {
        metadata = JSON.parse(values.metadata);
      } catch (e) {
        toast.error('Error', {
          description: 'Invalid JSON in metadata field',
        });
        return;
      }
    }

    const workspaceData: CreateWorkspaceInput = {
      orgId,
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      ...(metadata ? { metadata } : {}),
    };

    createWorkspaceMutation.mutate(workspaceData, {
      onSuccess: () => {
        toast.success('Workspace created', {
          description: 'Workspace has been created successfully',
        });
        refetchWorkspaces();
        createWorkspaceForm.reset();
      },
      onError: (error) => {
        toast.error('Error creating workspace', {
          description: error.message || 'An unknown error occurred',
        });
      },
    });
  };

  // Handle update workspace form submission
  const onUpdateWorkspaceSubmit = (
    values: z.infer<typeof updateWorkspaceSchema>
  ) => {
    if (!selectedWorkspaceId) {
      toast.error('Error', {
        description: 'Please select a workspace first',
      });
      return;
    }

    let metadata: Record<string, unknown> | undefined;

    if (values.metadata) {
      try {
        metadata = JSON.parse(values.metadata);
      } catch (e) {
        toast.error('Error', {
          description: 'Invalid JSON in metadata field',
        });
        return;
      }
    }

    const updateData: UpdateWorkspaceInput = {
      workspaceId: selectedWorkspaceId,
      orgId,
      ...(values.name ? { name: values.name } : {}),
      ...(values.description ? { description: values.description } : {}),
      ...(metadata ? { metadata } : {}),
    };

    updateWorkspaceMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Workspace updated', {
          description: 'Workspace has been updated successfully',
        });
        refetchWorkspace();
        refetchWorkspaces();
        updateWorkspaceForm.reset();
      },
      onError: (error) => {
        toast.error('Error updating workspace', {
          description: error.message || 'An unknown error occurred',
        });
      },
    });
  };

  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPaginationOptions({
      ...paginationOptions,
      page: newPage,
    });
  };

  // Handle workspace selection
  const handleSelectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    workspaceIdForm.setValue('workspaceId', workspaceId);
  };

  return (
    <div className="space-y-8">
      {/* Organization ID Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Organization ID</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...orgIdForm}>
            <form
              onSubmit={orgIdForm.handleSubmit(onOrgIdSubmit)}
              className="space-y-4"
            >
              <FormField
                control={orgIdForm.control}
                name="orgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization ID</FormLabel>
                    <FormControl>
                      <Input placeholder="org_123456" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the ID of the organization to fetch workspaces for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingWorkspaces}>
                {isLoadingWorkspaces ? 'Loading...' : 'Fetch Workspaces'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Error */}
      {workspacesError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {workspacesError instanceof Error
              ? workspacesError.message
              : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Display Workspaces */}
      {workspaces && workspaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Card
                  key={workspace.id}
                  className={`overflow-hidden cursor-pointer ${
                    selectedWorkspaceId === workspace.id ? 'border-primary' : ''
                  }`}
                  onClick={() => handleSelectWorkspace(workspace.id)}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-semibold">ID:</div>
                      <div className="font-mono">{workspace.id}</div>

                      <div className="font-semibold">Name:</div>
                      <div>{workspace.name}</div>

                      {workspace.description && (
                        <>
                          <div className="font-semibold">Description:</div>
                          <div>{workspace.description}</div>
                        </>
                      )}

                      <div className="font-semibold">Created:</div>
                      <div>
                        {workspace.createdAt
                          ? new Date(workspace.createdAt).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={paginationOptions.page === 1}
                onClick={() => handlePageChange(paginationOptions.page! - 1)}
              >
                Previous
              </Button>
              <span>Page {paginationOptions.page}</span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(paginationOptions.page! + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {workspaces && workspaces.length === 0 && (
        <Alert>
          <AlertTitle>No Workspaces</AlertTitle>
          <AlertDescription>
            No workspaces found for this organization.
          </AlertDescription>
        </Alert>
      )}

      {/* Workspace Operations */}
      {orgId && (
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Workspace</TabsTrigger>
            <TabsTrigger value="view" disabled={!selectedWorkspaceId}>
              View Workspace
            </TabsTrigger>
            <TabsTrigger value="update" disabled={!selectedWorkspaceId}>
              Update Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...createWorkspaceForm}>
                  <form
                    onSubmit={createWorkspaceForm.handleSubmit(
                      onCreateWorkspaceSubmit
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={createWorkspaceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Workspace" {...field} />
                          </FormControl>
                          <FormDescription>
                            Name of the workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createWorkspaceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A description of the workspace"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Description of the workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createWorkspaceForm.control}
                      name="metadata"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metadata (Optional JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='{"theme": "light", "features": ["docs", "chat"]}'
                              className="font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Additional metadata as JSON
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={createWorkspaceMutation.isPending}
                    >
                      {createWorkspaceMutation.isPending
                        ? 'Creating...'
                        : 'Create Workspace'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Details</CardTitle>
              </CardHeader>
              <CardContent>
                {workspaceError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {workspaceError instanceof Error
                        ? workspaceError.message
                        : 'An unknown error occurred'}
                    </AlertDescription>
                  </Alert>
                )}

                {isLoadingWorkspace && <p>Loading workspace details...</p>}

                {selectedWorkspace && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold">ID</div>
                        <div className="font-mono text-sm">
                          {selectedWorkspace.id}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Organization ID</div>
                        <div className="font-mono text-sm">
                          {selectedWorkspace.orgId}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Name</div>
                        <div className="text-sm">{selectedWorkspace.name}</div>
                      </div>
                      {selectedWorkspace.description && (
                        <div>
                          <div className="font-semibold">Description</div>
                          <div className="text-sm">
                            {selectedWorkspace.description}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">Created At</div>
                        <div className="text-sm">
                          {selectedWorkspace.createdAt
                            ? new Date(
                                selectedWorkspace.createdAt
                              ).toLocaleString()
                            : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Updated At</div>
                        <div className="text-sm">
                          {selectedWorkspace.updatedAt
                            ? new Date(
                                selectedWorkspace.updatedAt
                              ).toLocaleString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {selectedWorkspace.metadata &&
                      Object.keys(selectedWorkspace.metadata).length > 0 && (
                        <div>
                          <div className="font-semibold">Metadata</div>
                          <pre className="mt-2 p-4 bg-muted rounded-md overflow-x-auto font-mono text-xs">
                            {JSON.stringify(
                              selectedWorkspace.metadata,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="update">
            <Card>
              <CardHeader>
                <CardTitle>Update Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...updateWorkspaceForm}>
                  <form
                    onSubmit={updateWorkspaceForm.handleSubmit(
                      onUpdateWorkspaceSubmit
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={updateWorkspaceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                selectedWorkspace?.name || 'New name'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            New name for the workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={updateWorkspaceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                selectedWorkspace?.description ||
                                'New description'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            New description for the workspace
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={updateWorkspaceForm.control}
                      name="metadata"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metadata (Optional JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                selectedWorkspace?.metadata
                                  ? JSON.stringify(
                                      selectedWorkspace.metadata,
                                      null,
                                      2
                                    )
                                  : '{"theme": "light", "features": ["docs", "chat"]}'
                              }
                              className="font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            New metadata as JSON
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={updateWorkspaceMutation.isPending}
                    >
                      {updateWorkspaceMutation.isPending
                        ? 'Updating...'
                        : 'Update Workspace'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
