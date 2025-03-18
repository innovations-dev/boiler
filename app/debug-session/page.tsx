import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { SessionDebugServer } from './session-debug-server';
import { SessionTestClient } from './session-test-client';

export const dynamic = 'force-dynamic';

export default async function DebugSessionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Session Debugging Tools</h1>

      <div className="space-y-8">
        {/* Client-side session testing dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Real-time Session Testing
          </h2>
          <div className="bg-background/90 rounded-lg shadow-md border border-border/60">
            <SessionTestClient />
          </div>
        </div>

        {/* Server-side session debug */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Server-side Session Debug
          </h2>
          <div className="bg-background/90 rounded-lg shadow-md border border-border/60 p-6">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                  <Skeleton className="h-[100px] w-full" />
                </div>
              }
            >
              <SessionDebugServer />
            </Suspense>
          </div>
        </div>

        {/* API Session Debugging section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">API Session Debugging</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-background/90 rounded-lg shadow-md border border-border/60">
              <h3 className="text-lg font-medium mb-4">
                Session Inspection Endpoints
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2">
                    <a
                      href="/api/auth-debug"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Auth Debug Endpoint
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive session debugging using Better-Auth native
                    methods.
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    <a
                      href="/api/auth-inspect"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Inspect Session Structure
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Shows detailed information about the Better-Auth session
                    structure.
                  </p>
                </div>

                <div>
                  <p className="mb-2">
                    <a
                      href="/api/auth-test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Test Session Validation
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tests session validation using Better-Auth methods.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
