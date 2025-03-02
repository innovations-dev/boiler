'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { ErrorDisplay } from '@/app/_components/errors/error-display';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  CreateWorkspaceRequest,
  OrganizationWorkspace,
  UpdateWorkspaceRequest,
} from '@/lib/domains/organization/types';
import { handleUnknownError } from '@/lib/errors';
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
} from '@/lib/hooks/use-organization-extensions';
import { ErrorResponse } from '@/lib/types/responses/error';

/**
 * Workspace form schema
 */
const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
});

/**
 * Workspace form values
 */
type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

/**
 * Props for the WorkspaceDialog component
 */
interface WorkspaceDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Base WorkspaceDialog component
 */
export function WorkspaceDialog({
  children,
  open,
  onOpenChange,
}: WorkspaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

/**
 * Props for the WorkspaceDialog.Trigger component
 */
interface WorkspaceDialogTriggerProps {
  children: React.ReactNode;
}

/**
 * Trigger component for the WorkspaceDialog
 */
WorkspaceDialog.Trigger = function WorkspaceDialogTrigger({
  children,
}: WorkspaceDialogTriggerProps) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
};

/**
 * Props for the WorkspaceDialog.Content component
 */
interface WorkspaceDialogContentProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Content component for the WorkspaceDialog
 */
WorkspaceDialog.Content = function WorkspaceDialogContent({
  title,
  description,
  children,
}: WorkspaceDialogContentProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  );
};

/**
 * Props for the WorkspaceDialog.Form component
 */
interface WorkspaceDialogFormProps {
  defaultValues: Partial<WorkspaceFormValues>;
  onSubmit: (values: WorkspaceFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

/**
 * Form component for the WorkspaceDialog
 */
WorkspaceDialog.Form = function WorkspaceDialogForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
}: WorkspaceDialogFormProps) {
  const [formError, setFormError] = React.useState<ErrorResponse | null>(null);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: WorkspaceFormValues) => {
    try {
      setFormError(null);
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);

      // Convert to standard error response
      const errorResponse = handleUnknownError(error, 'WorkspaceDialog.Form');
      setFormError(errorResponse);

      // If the error contains field-specific errors, set them on the form
      if (error instanceof Error && 'context' in error && error.context) {
        const fieldErrors = error.context as Record<string, string[]>;

        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (field in form.formState.errors) {
            form.setError(field as any, {
              type: 'server',
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          }
        });
      }
    }
  };

  const resetError = () => {
    setFormError(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {formError && (
          <div className="mb-4">
            <ErrorDisplay error={formError} />
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter workspace name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...form.register('organizationId')} />

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

/**
 * Props for the WorkspaceDialog.Confirmation component
 */
interface WorkspaceDialogConfirmationProps {
  message: string;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

/**
 * Confirmation component for the WorkspaceDialog
 */
WorkspaceDialog.Confirmation = function WorkspaceDialogConfirmation({
  message,
  onConfirm,
  isConfirming = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
}: WorkspaceDialogConfirmationProps) {
  const [confirmError, setConfirmError] = React.useState<ErrorResponse | null>(
    null
  );

  const handleConfirm = async () => {
    try {
      setConfirmError(null);
      await onConfirm();
    } catch (error) {
      console.error('Confirmation error:', error);

      // Convert to standard error response
      const errorResponse = handleUnknownError(
        error,
        'WorkspaceDialog.Confirmation'
      );
      setConfirmError(errorResponse);
    }
  };

  const resetError = () => {
    setConfirmError(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{message}</p>

      {confirmError && (
        <div className="mb-4">
          <ErrorDisplay error={confirmError} />
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Processing...' : confirmLabel}
        </Button>
      </DialogFooter>
    </div>
  );
};
