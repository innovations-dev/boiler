'use client';

/**
 * @fileoverview Example component demonstrating the organization permission system
 *
 * This component shows how to use both synchronous and asynchronous permission checks:
 * 1. Synchronous checks with useOrganization().hasPermission() - for immediate UI decisions
 * 2. Asynchronous checks with useCheckPermission() - for accurate permission validation
 */
import { useState } from 'react';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  ShieldIcon,
  XCircleIcon,
} from 'lucide-react';

import {
  useCheckPermission,
  useOrganization,
} from '@/app/(dashboard)/_context/organization-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Permission example component
 *
 * This component demonstrates how to use both synchronous and asynchronous
 * permission checks in your components.
 */
export function PermissionExample() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Organization Permission System</CardTitle>
        <CardDescription>
          Demonstrates both synchronous and asynchronous permission checks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sync">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sync">Synchronous Checks</TabsTrigger>
            <TabsTrigger value="async">Asynchronous Checks</TabsTrigger>
          </TabsList>
          <TabsContent value="sync" className="space-y-4 mt-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Synchronous Permission Checks</AlertTitle>
              <AlertDescription>
                Use <code>useOrganization().hasPermission()</code> for immediate
                UI decisions where waiting for an API response would cause UI
                flickering. These are based on role defaults and may not reflect
                custom permissions.
              </AlertDescription>
            </Alert>

            <SynchronousPermissionChecks />
          </TabsContent>

          <TabsContent value="async" className="space-y-4 mt-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Asynchronous Permission Checks</AlertTitle>
              <AlertDescription>
                Use <code>useCheckPermission()</code> for accurate permission
                validation that may require server-side logic. These checks
                reflect the actual permissions configured in Better-Auth.
              </AlertDescription>
            </Alert>

            <AsynchronousPermissionChecks />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          See documentation for more details on the permission system.
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Synchronous permission checks example
 */
function SynchronousPermissionChecks() {
  const { hasPermission, isRole, currentMember } = useOrganization();

  // Common permissions to check
  const permissions = [
    { name: 'view_organization', description: 'View organization details' },
    { name: 'edit_organization', description: 'Edit organization settings' },
    { name: 'delete_organization', description: 'Delete the organization' },
    { name: 'invite_members', description: 'Invite new members' },
    { name: 'remove_members', description: 'Remove members' },
    { name: 'manage_workspaces', description: 'Manage workspaces' },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-muted/50">
        <h3 className="font-medium mb-2">Current Role: {currentMember.role}</h3>
        <div className="text-sm text-muted-foreground">
          Permissions are determined based on your role in the organization.
        </div>
      </div>

      <div className="space-y-2">
        {permissions.map((permission) => (
          <div
            key={permission.name}
            className="flex items-center justify-between p-3 border rounded-md"
          >
            <div>
              <div className="font-medium">{permission.name}</div>
              <div className="text-sm text-muted-foreground">
                {permission.description}
              </div>
            </div>
            <div>
              {hasPermission(permission.name) ? (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  <span>Allowed</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircleIcon className="h-5 w-5 mr-1" />
                  <span>Denied</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
        <div className="flex items-start">
          <AlertTriangleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Important Note</h3>
            <p className="text-sm">
              Synchronous checks are based on role defaults and may not reflect
              custom permissions. For accurate permission validation, use
              asynchronous checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Asynchronous permission checks example
 */
function AsynchronousPermissionChecks() {
  // Common permissions to check
  const permissions = [
    { name: 'view_organization', description: 'View organization details' },
    { name: 'edit_organization', description: 'Edit organization settings' },
    { name: 'delete_organization', description: 'Delete the organization' },
    { name: 'invite_members', description: 'Invite new members' },
    { name: 'remove_members', description: 'Remove members' },
    { name: 'manage_workspaces', description: 'Manage workspaces' },
  ];

  const [selectedPermission, setSelectedPermission] = useState(
    permissions[0].name
  );

  // Use the asynchronous permission check
  const {
    data: hasPermission,
    isLoading,
    error,
  } = useCheckPermission(selectedPermission);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {permissions.map((permission) => (
          <Button
            key={permission.name}
            variant={
              selectedPermission === permission.name ? 'default' : 'outline'
            }
            onClick={() => setSelectedPermission(permission.name)}
            className="justify-start"
          >
            <ShieldIcon className="h-4 w-4 mr-2" />
            {permission.name}
          </Button>
        ))}
      </div>

      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-2">
          Checking permission: {selectedPermission}
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error checking permission</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mt-2">
            {hasPermission ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircleIcon className="h-4 w-4" />
                <AlertTitle>Permission Granted</AlertTitle>
                <AlertDescription>
                  You have the "{selectedPermission}" permission for this
                  organization.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                <XCircleIcon className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                  You do not have the "{selectedPermission}" permission for this
                  organization.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border rounded-md bg-blue-50 text-blue-800">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Implementation Example</h3>
            <pre className="text-xs mt-2 p-2 bg-blue-100 rounded overflow-x-auto">
              {`const { data: canManageWorkspaces, isLoading } = useCheckPermission('manage_workspaces');

// Use with loading state
{isLoading ? (
  <LoadingSpinner />
) : canManageWorkspaces ? (
  <ManageButton />
) : null}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
