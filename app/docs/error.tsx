'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Navigation error:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
      <p>Something went wrong loading this page.</p>
      <Button variant="ghost" size="sm" onClick={reset} className="mt-2">
        Try Again
      </Button>
    </div>
  );
}
