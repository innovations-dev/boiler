'use client';

import { AlertCircle } from 'lucide-react';

/**
 * Component for displaying form field errors with consistent styling
 */
export function FormFieldError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-1 text-sm text-destructive mt-1">
      <AlertCircle className="h-3.5 w-3.5" />
      <p>{message}</p>
    </div>
  );
}
