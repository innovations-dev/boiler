'use client';

import { useEffect } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  error: Error;
  resetAction: () => void;
  variant?: 'default' | 'full';
}

/**
 * A flexible error boundary component for displaying errors with different visual styles.
 * Automatically logs errors and provides retry functionality.
 */
export function ErrorBoundary({
  error,
  resetAction,
  variant = 'default',
}: ErrorBoundaryProps) {
  useEffect(() => {
    const appError = handleUnknownError(error);
    logger.error(
      'Error boundary caught an error',
      {
        component: 'ErrorBoundary',
        variant,
        errorCode: appError.code,
        errorStatus: appError.status,
      },
      error
    );
  }, [error, variant]);

  if (variant === 'full') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <Button onClick={resetAction} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center gap-x-2">
        {error.message}
        <Button variant="outline" size="sm" onClick={resetAction}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
