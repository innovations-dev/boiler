'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(
      'Documentation navigation error',
      {
        component: 'DocsError',
        path: window.location.pathname,
        digest: error.digest,
      },
      error
    );
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
