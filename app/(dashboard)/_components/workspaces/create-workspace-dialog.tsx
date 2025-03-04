'use client';

import * as React from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { CreateWorkspaceRequest } from '@/lib/domains/organization/types';
import { useCreateWorkspace } from '@/lib/hooks/organizations/use-organization-extensions';

import { WorkspaceDialog } from './workspace-dialog';

/**
 * Props for the CreateWorkspaceDialog component
 */
interface CreateWorkspaceDialogProps {
  organizationId: string;
  onSuccess?: () => void;
}

/**
 * Dialog for creating a new workspace
 *
 * @example
 * ```tsx
 * <CreateWorkspaceDialog organizationId="org_123" onSuccess={() => refetch()} />
 * ```
 */
export function CreateWorkspaceDialog({
  organizationId,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();
  const { data: session } = authClient.useSession();

  const handleSubmit = async (values: {
    name: string;
    organizationId: string;
  }) => {
    try {
      if (!session?.user.id) {
        throw new Error('User not authenticated');
      }

      const request: CreateWorkspaceRequest = {
        name: values.name,
        organizationId: values.organizationId,
        createdBy: session.user.id,
      };

      await createWorkspace(request);

      toast.success('Workspace created successfully');
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the WorkspaceDialog.Form component
      throw error;
    }
  };

  return (
    <WorkspaceDialog open={open} onOpenChange={setOpen}>
      <WorkspaceDialog.Trigger>
        <Button size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </WorkspaceDialog.Trigger>
      <WorkspaceDialog.Content
        title="Create Workspace"
        description="Add a new workspace to your organization."
      >
        <WorkspaceDialog.Form
          defaultValues={{
            name: '',
            organizationId,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Create"
          onCancel={() => setOpen(false)}
        />
      </WorkspaceDialog.Content>
    </WorkspaceDialog>
  );
}
