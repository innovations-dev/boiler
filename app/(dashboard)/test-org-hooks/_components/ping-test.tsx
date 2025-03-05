/**
 * Organization Ping Test Component
 *
 * This component demonstrates the usage of the ping functionality
 * and provides a UI for testing it.
 *
 * @module app/(dashboard)/test-org-hooks/components/ping-test
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePing } from '@/lib/hooks/org/use-ping';

/**
 * Ping Test Section Component
 *
 * This component provides a UI for testing the ping functionality.
 */
export function PingTestSection() {
  const [isPinging, setIsPinging] = useState(false);
  const pingQuery = usePing();

  const handlePing = async () => {
    try {
      setIsPinging(true);
      await pingQuery.refetch();
      toast.success('Ping successful!');
    } catch (error) {
      toast.error('Ping failed!');
      console.error('Ping error:', error);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test Ping Functionality</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Button
              onClick={handlePing}
              disabled={isPinging || pingQuery.isFetching}
              className="w-full"
            >
              {isPinging || pingQuery.isFetching
                ? 'Pinging...'
                : 'Ping Custom Org Plugin'}
            </Button>
          </div>

          {pingQuery.isSuccess && pingQuery.data && (
            <div className="p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Ping Response:</h3>
              <pre className="text-sm overflow-auto p-2 bg-card rounded">
                {JSON.stringify(pingQuery.data, null, 2)}
              </pre>
            </div>
          )}

          {pingQuery.isError && (
            <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
              <h3 className="font-medium mb-2">Error:</h3>
              <pre className="text-sm overflow-auto p-2 bg-card rounded">
                {JSON.stringify(pingQuery.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {pingQuery.isSuccess &&
            'Last ping: ' + new Date().toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}
