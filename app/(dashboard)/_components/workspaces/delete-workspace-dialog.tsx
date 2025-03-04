'use client';

import * as React from 'react';
import { TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { OrganizationWorkspace } from '@/lib/domains/organization/types';
import { useDeleteWorkspace } from '@/lib/hooks/organizations/use-organization-extensions';

import { WorkspaceDialog } from './workspace-dialog';

/**
 * Props for the DeleteWorkspaceDialog component
 */
interface DeleteWorkspaceDialogProps {
  workspace: OrganizationWorkspace;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

/**
 * Dialog for deleting a workspace
 *
 * @example
 * ```tsx
 * <DeleteWorkspaceDialog
 *   workspace={workspace}
 *   onSuccess={() => refetch()}
 *   trigger={<Button size="sm" variant="ghost"><TrashIcon className="h-4 w-4" /></Button>}
 * />
 * ```
 */
export function DeleteWorkspaceDialog({
  workspace,
  onSuccess,
  trigger,
}: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutateAsync: deleteWorkspace, isPending } = useDeleteWorkspace();

  const handleConfirm = async () => {
    try {
      await deleteWorkspace({
        organizationId: workspace.organizationId,
        workspaceId: workspace.id,
      });

      toast.success('Workspace deleted successfully');
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the WorkspaceDialog.Confirmation component
      throw error;
    }
  };

  return (
    <WorkspaceDialog open={open} onOpenChange={setOpen}>
      <WorkspaceDialog.Trigger>
        {trigger || (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive"
          >
            <span className="sr-only">Delete workspace</span>
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </WorkspaceDialog.Trigger>
      <WorkspaceDialog.Content
        title="Delete Workspace"
        description="Are you sure you want to delete this workspace?"
      >
        <WorkspaceDialog.Confirmation
          message={`This will permanently delete the workspace "${workspace.name}" and all of its data. This action cannot be undone.`}
          onConfirm={handleConfirm}
          isConfirming={isPending}
          confirmLabel="Delete Workspace"
          onCancel={() => setOpen(false)}
        />
      </WorkspaceDialog.Content>
    </WorkspaceDialog>
  );
}
