/**
 * Organization Activity Test Component
 *
 * This component demonstrates the usage of organization activity hooks
 * and provides a UI for testing them.
 *
 * @module app/(dashboard)/test-org-hooks/components/activity-test
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useOrgActivity,
  type PaginationOptions,
} from '@/lib/hooks/org/use-org-activity';
import {
  useRecordActivity,
  type RecordActivityInput,
} from '@/lib/hooks/org/use-record-activity';

/**
 * Form schema for organization ID input
 */
const orgIdSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
});

/**
 * Form schema for recording activity
 */
const recordActivitySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.string().min(1, 'Action is required'),
  resourceType: z.string().min(1, 'Resource type is required'),
  resourceId: z.string().optional(),
  metadata: z.string().optional(),
});

/**
 * Organization Activity Test Section
 *
 * This component provides a UI for testing the organization activity hooks.
 * It allows fetching activity for a specific organization and recording new activity.
 */
export function ActivityTestSection() {
  const [orgId, setOrgId] = useState<string>('');
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>(
    {
      limit: 10,
      page: 1,
    }
  );

  // Form for entering organization ID
  const orgIdForm = useForm<z.infer<typeof orgIdSchema>>({
    resolver: zodResolver(orgIdSchema),
    defaultValues: {
      orgId: '',
    },
  });

  // Form for recording activity
  const recordActivityForm = useForm<z.infer<typeof recordActivitySchema>>({
    resolver: zodResolver(recordActivitySchema),
    defaultValues: {
      userId: '',
      action: '',
      resourceType: '',
      resourceId: '',
      metadata: '',
    },
  });

  // Fetch activity for the specified organization
  const {
    data: activities,
    isLoading,
    error,
    refetch,
  } = useOrgActivity(orgId, paginationOptions);

  // Mutation for recording activity
  const recordActivityMutation = useRecordActivity();

  // Handle organization ID form submission
  const onOrgIdSubmit = (values: z.infer<typeof orgIdSchema>) => {
    setOrgId(values.orgId);
    toast.success(`Fetching activit for organization: ${values.orgId}`);
  };

  // Handle record activity form submission
  const onRecordActivitySubmit = (
    values: z.infer<typeof recordActivitySchema>
  ) => {
    if (!orgId) {
      toast.error('Please enter an organization ID first');
      return;
    }

    let metadata: Record<string, unknown> | undefined;

    if (values.metadata) {
      try {
        metadata = JSON.parse(values.metadata);
      } catch (e) {
        toast.error('Invalid JSON in metadata field');
        return;
      }
    }

    const activityData: RecordActivityInput = {
      orgId,
      userId: values.userId,
      action: values.action,
      resourceType: values.resourceType,
      ...(values.resourceId ? { resourceId: values.resourceId } : {}),
      ...(metadata ? { metadata } : {}),
    };

    recordActivityMutation.mutate(activityData, {
      onSuccess: () => {
        toast.success('Activity recorded');

        refetch();
        recordActivityForm.reset();
      },
      onError: (error) => {
        toast.error('Error recording activity');
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
                      Enter the ID of the organization to fetch activity for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch Activity'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Display Activity */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={activity.id || index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-semibold">User ID:</div>
                      <div className="font-mono">{activity.userId}</div>

                      <div className="font-semibold">Action:</div>
                      <div>{activity.action}</div>

                      <div className="font-semibold">Resource Type:</div>
                      <div>{activity.resourceType}</div>

                      {activity.resourceId && (
                        <>
                          <div className="font-semibold">Resource ID:</div>
                          <div className="font-mono">{activity.resourceId}</div>
                        </>
                      )}

                      <div className="font-semibold">Timestamp:</div>
                      <div>
                        {activity.timestamp
                          ? new Date(activity.timestamp).toLocaleString()
                          : 'N/A'}
                      </div>

                      {activity.metadata &&
                        Object.keys(activity.metadata).length > 0 && (
                          <>
                            <div className="font-semibold">Metadata:</div>
                            <div className="font-mono text-xs overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </div>
                          </>
                        )}
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

      {activities && activities.length === 0 && (
        <Alert>
          <AlertTitle>No Activity</AlertTitle>
          <AlertDescription>
            No activity found for this organization.
          </AlertDescription>
        </Alert>
      )}

      {/* Record Activity Form */}
      {orgId && (
        <Card>
          <CardHeader>
            <CardTitle>Record Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...recordActivityForm}>
              <form
                onSubmit={recordActivityForm.handleSubmit(
                  onRecordActivitySubmit
                )}
                className="space-y-4"
              >
                <FormField
                  control={recordActivityForm.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input placeholder="user_123456" {...field} />
                      </FormControl>
                      <FormDescription>
                        ID of the user performing the action
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordActivityForm.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created">Created</SelectItem>
                            <SelectItem value="updated">Updated</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="shared">Shared</SelectItem>
                            <SelectItem value="exported">Exported</SelectItem>
                            <SelectItem value="imported">Imported</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        The action performed by the user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordActivityForm.control}
                  name="resourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resource" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="workspace">Workspace</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="settings">Settings</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        The type of resource the action was performed on
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordActivityForm.control}
                  name="resourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="resource_123456" {...field} />
                      </FormControl>
                      <FormDescription>
                        ID of the resource the action was performed on
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordActivityForm.control}
                  name="metadata"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metadata (Optional JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"key": "value"}'
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
                  disabled={recordActivityMutation.isPending}
                >
                  {recordActivityMutation.isPending
                    ? 'Recording...'
                    : 'Record Activity'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
