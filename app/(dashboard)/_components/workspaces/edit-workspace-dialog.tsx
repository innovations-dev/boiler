'use client';

import * as React from 'react';
import { PencilIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import {
  OrganizationWorkspace,
  UpdateWorkspaceRequest,
} from '@/lib/domains/organization/types';
import { useUpdateWorkspace } from '@/lib/hooks/organizations';

import { WorkspaceDialog } from './workspace-dialog';

/**
 * Props for the EditWorkspaceDialog component
 */
interface EditWorkspaceDialogProps {
  workspace: OrganizationWorkspace;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

/**
 * Dialog for editing an existing workspace
 *
 * @example
 * ```tsx
 * <EditWorkspaceDialog
 *   workspace={workspace}
 *   onSuccess={() => refetch()}
 *   trigger={<Button size="sm" variant="ghost"><PencilIcon className="h-4 w-4" /></Button>}
 * />
 * ```
 */
export function EditWorkspaceDialog({
  workspace,
  onSuccess,
  trigger,
}: EditWorkspaceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();
  const { data: session } = authClient.useSession();

  const handleSubmit = async (values: {
    name: string;
    organizationId: string;
  }) => {
    try {
      if (!session?.user.id) {
        throw new Error('User not authenticated');
      }

      const request: UpdateWorkspaceRequest = {
        id: workspace.id,
        organizationId: values.organizationId,
        name: values.name,
        updatedBy: session.user.id,
      };

      await updateWorkspace({
        organizationId: values.organizationId,
        workspaceId: workspace.id,
        name: values.name,
        description: workspace.description,
      });

      toast.success('Workspace updated successfully');
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
        {trigger || (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Edit workspace</span>
            <PencilIcon className="h-4 w-4" />
          </Button>
        )}
      </WorkspaceDialog.Trigger>
      <WorkspaceDialog.Content
        title="Edit Workspace"
        description="Update workspace details."
      >
        <WorkspaceDialog.Form
          defaultValues={{
            name: workspace.name,
            organizationId: workspace.organizationId,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
          onCancel={() => setOpen(false)}
        />
      </WorkspaceDialog.Content>
    </WorkspaceDialog>
  );
}
