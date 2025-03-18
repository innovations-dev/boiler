/**
 * Organization Metrics Test Component
 *
 * This component demonstrates the usage of organization metrics hooks
 * and provides a UI for testing them.
 *
 * @module app/(dashboard)/test-org-hooks/components/metrics-test
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
import { Label } from '@/components/ui/label';
import { useOrgMetrics } from '@/lib/hooks/org/use-org-metrics';
import {
  useUpdateMetrics,
  type UpdateMetricsInput,
} from '@/lib/hooks/org/use-update-metrics';

/**
 * Form schema for organization ID input
 */
const orgIdSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
});

/**
 * Form schema for updating metrics
 */
const updateMetricsSchema = z.object({
  activeUsers: z.coerce.number().int().nonnegative().optional(),
  totalWorkspaces: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Organization Metrics Test Section
 *
 * This component provides a UI for testing the organization metrics hooks.
 * It allows fetching metrics for a specific organization and updating them.
 */
export function MetricsTestSection() {
  const [orgId, setOrgId] = useState<string>('');

  // Form for entering organization ID
  const orgIdForm = useForm<z.infer<typeof orgIdSchema>>({
    resolver: zodResolver(orgIdSchema),
    defaultValues: {
      orgId: '',
    },
  });

  // Form for updating metrics
  const updateMetricsForm = useForm<z.infer<typeof updateMetricsSchema>>({
    resolver: zodResolver(updateMetricsSchema),
    defaultValues: {
      activeUsers: undefined,
      totalWorkspaces: undefined,
    },
  });

  // Fetch metrics for the specified organization
  const { data: metrics, isLoading, error, refetch } = useOrgMetrics(orgId);

  // Mutation for updating metrics
  const updateMetricsMutation = useUpdateMetrics();

  // Handle organization ID form submission
  const onOrgIdSubmit = (values: z.infer<typeof orgIdSchema>) => {
    setOrgId(values.orgId);
    toast.info(`Fetching metrics for organization: ${values.orgId}`);
  };

  // Handle update metrics form submission
  const onUpdateMetricsSubmit = (
    values: z.infer<typeof updateMetricsSchema>
  ) => {
    if (!orgId) {
      toast.error('Please enter an organization ID first');
      return;
    }

    const updateData: UpdateMetricsInput = {
      orgId,
      ...values,
    };

    updateMetricsMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Organization metrics have been updated successfully');
        refetch();
        updateMetricsForm.reset();
      },
      onError: (error) => {
        toast(error.message || 'An unknown error occurred');
      },
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
                      Enter the ID of the organization to fetch metrics for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Fetch Metrics'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Metrics */}
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

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization ID</Label>
                <div className="mt-1 font-mono text-sm">{metrics.orgId}</div>
              </div>
              <div>
                <Label>Active Users</Label>
                <div className="mt-1 font-mono text-sm">
                  {metrics.activeUsers}
                </div>
              </div>
              <div>
                <Label>Total Workspaces</Label>
                <div className="mt-1 font-mono text-sm">
                  {metrics.totalWorkspaces}
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <div className="mt-1 font-mono text-sm">
                  {metrics.lastUpdated
                    ? new Date(metrics.lastUpdated).toLocaleString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Metrics Form */}
      {orgId && (
        <Card>
          <CardHeader>
            <CardTitle>Update Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...updateMetricsForm}>
              <form
                onSubmit={updateMetricsForm.handleSubmit(onUpdateMetricsSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={updateMetricsForm.control}
                  name="activeUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active Users</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of active users in the organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateMetricsForm.control}
                  name="totalWorkspaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Workspaces</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Total number of workspaces in the organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={updateMetricsMutation.isPending}
                >
                  {updateMetricsMutation.isPending
                    ? 'Updating...'
                    : 'Update Metrics'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
