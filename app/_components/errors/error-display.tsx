'use client';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { type ErrorResponse } from '@/lib/types/responses/error';

interface ErrorDisplayProps {
  error: ErrorResponse;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error: {error.code}</AlertTitle>
      <AlertDescription className="flex items-center gap-x-2">
        {error.message}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
