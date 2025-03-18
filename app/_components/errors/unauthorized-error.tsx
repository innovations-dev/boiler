'use client';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function UnauthorizedError() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Unauthorized Access</AlertTitle>
      <AlertDescription className="flex items-center gap-x-2">
        You don&apos;t have permission to access this resource.
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </AlertDescription>
    </Alert>
  );
}
