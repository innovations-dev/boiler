'use client';

import { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { EnhancedErrorDisplay } from '@/app/_components/errors/enhanced-error-display';
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
import { useErrorHandler } from '@/lib/hooks/use-error-handler';

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
  children?: ReactNode;
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
  children: ReactNode;
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
  children: ReactNode;
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
  const { error, fieldErrors, isRecovering, handleError, clearErrors } =
    useErrorHandler({
      context: 'WorkspaceDialog.Form',
      showToasts: false,
    });

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: WorkspaceFormValues) => {
    try {
      clearErrors();
      await onSubmit(values);
      form.reset();
      toast.success('Workspace saved successfully');
    } catch (error) {
      console.error('Form submission error:', error);

      // Handle the error using our error handler
      const { errorResponse, fieldErrors } = handleError(error, 'submit');

      // If the error contains field-specific errors, set them on the form
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (field in form.formState.errors) {
            form.setError(field as any, {
              type: 'server',
              message,
            });
          }
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <div className="mb-4">
            <EnhancedErrorDisplay
              error={error}
              onRetry={clearErrors}
              variant="alert"
            />
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
            disabled={isSubmitting || isRecovering}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting || isRecovering}>
            {isSubmitting || isRecovering ? 'Saving...' : submitLabel}
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
  const { error, isRecovering, handleError, clearErrors } = useErrorHandler({
    context: 'WorkspaceDialog.Confirmation',
    showToasts: false,
  });

  const handleConfirm = async () => {
    try {
      clearErrors();
      await onConfirm();
      toast.success('Operation completed successfully');
    } catch (error) {
      handleError(error, 'confirm');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <EnhancedErrorDisplay
          error={error}
          onRetry={clearErrors}
          variant="alert"
        />
      )}

      <p className="text-sm text-muted-foreground">{message}</p>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isConfirming || isRecovering}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirm}
          disabled={isConfirming || isRecovering}
        >
          {isConfirming || isRecovering ? 'Processing...' : confirmLabel}
        </Button>
      </DialogFooter>
    </div>
  );
};
