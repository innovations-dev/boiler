/**
 * Organization Hooks Test Page
 *
 * This page provides a visual testing environment for the organization hooks.
 * It demonstrates how to use the hooks in a real-world scenario and allows
 * for manual testing of the functionality.
 *
 * @module app/(dashboard)/test-org-hooks/page
 */

import { Suspense } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ActivityTestSection } from './_components/activity-test';
// Import test components
import { MetricsTestSection } from './_components/metrics-test';
import { PingTestSection } from './_components/ping-test';
import { WorkspacesTestSection } from './_components/workspaces-test';

/**
 * Loading component for the test page
 */
function TestPageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <Skeleton className="h-[450px] w-full rounded-md" />
    </div>
  );
}

/**
 * Organization Hooks Test Page
 *
 * This page provides a visual testing environment for the organization hooks.
 * It includes sections for testing metrics, activity, and workspaces functionality.
 */
export default function TestOrgHooksPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Hooks Testing
        </h1>
        <p className="text-muted-foreground">
          This page demonstrates the usage of organization hooks and allows for
          manual testing.
        </p>
      </div>

      <Tabs defaultValue="ping" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ping">Ping</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="ping">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Connectivity Test</CardTitle>
              <CardDescription>
                Test the basic connectivity to the custom organization plugin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TestPageLoading />}>
                <PingTestSection />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Organization Metrics</CardTitle>
              <CardDescription>
                Test the metrics hooks for fetching and updating organization
                metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TestPageLoading />}>
                <MetricsTestSection />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Organization Activity</CardTitle>
              <CardDescription>
                Test the activity hooks for fetching and recording organization
                activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TestPageLoading />}>
                <ActivityTestSection />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces">
          <Card>
            <CardHeader>
              <CardTitle>Organization Workspaces</CardTitle>
              <CardDescription>
                Test the workspace hooks for managing organization workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TestPageLoading />}>
                <WorkspacesTestSection />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
