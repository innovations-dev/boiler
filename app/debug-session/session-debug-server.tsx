import { debugSession } from '@/lib/auth/debug-session';
import { logger } from '@/lib/logger';

interface SessionInfo {
  id: string;
  isActive: boolean;
  createdAt: string | Date;
  expiresAt: string | Date;
  userId: string;
}

export async function SessionDebugServer() {
  let debugInfo;
  let error = null;

  try {
    debugInfo = await debugSession();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    logger.error('Error in SessionDebugServer component', { error }, err);

    // Provide fallback data structure
    debugInfo = {
      timestamp: new Date().toISOString(),
      headers: {},
      cookies: { names: [] },
      session: null,
      error: error,
    };
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md mb-4 border border-red-200">
          <p className="font-medium">
            Error loading session debug information:
          </p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Session Status</h3>
          <div className="bg-background/80 p-4 rounded-md border border-border/60 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Has Valid Session:</span>
                <span
                  className={
                    debugInfo?.session?.hasSession
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }
                >
                  {debugInfo?.session?.hasSession ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Has User:</span>
                <span
                  className={
                    debugInfo?.session?.hasUser
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }
                >
                  {debugInfo?.session?.hasUser ? 'Yes' : 'No'}
                </span>
              </div>
              {debugInfo?.session?.email && (
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{debugInfo.session.email}</span>
                </div>
              )}
              {debugInfo?.session?.userId && (
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="font-mono text-sm">
                    {debugInfo.session.userId}
                  </span>
                </div>
              )}
              {debugInfo?.session?.sessionId && (
                <div className="flex justify-between">
                  <span className="font-medium">Session ID:</span>
                  <span className="font-mono text-sm">
                    {debugInfo.session.sessionId}
                  </span>
                </div>
              )}
              {debugInfo?.session?.expiresAt && (
                <div className="flex justify-between">
                  <span className="font-medium">Expires At:</span>
                  <span>
                    {new Date(
                      debugInfo.session.expiresAt as string
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              {debugInfo?.error && !error && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded border border-red-200">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{String(debugInfo.error)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Headers & Cookies</h3>
          <div className="bg-background/80 p-4 rounded-md border border-border/60 shadow-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Headers</h4>
                <div className="text-sm space-y-1">
                  {Object.entries(debugInfo?.headers || {}).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-mono">{key}:</span>
                        <span
                          className={
                            value === 'present'
                              ? 'text-green-600 font-medium'
                              : 'text-red-600 font-medium'
                          }
                        >
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Cookies</h4>
                {debugInfo?.cookies?.names?.length > 0 ? (
                  <div className="text-sm space-y-1 max-h-40 overflow-y-auto bg-background/60 p-2 rounded border border-border/40">
                    {debugInfo.cookies.names.map(
                      (name: string, index: number) => (
                        <div
                          key={index}
                          className={
                            name.includes('better-auth')
                              ? 'text-blue-600 font-medium'
                              : ''
                          }
                        >
                          {name}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No cookies found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {debugInfo?.multiSession && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            Multi-Session Information
          </h3>
          <div className="bg-background/80 p-4 rounded-md border border-border/60 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Active Sessions:</span>
              <span className="font-medium">
                {debugInfo.multiSession.count}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debugInfo.multiSession.sessions.map(
                (session: SessionInfo, index: number) => (
                  <div
                    key={index}
                    className="p-2 bg-background/60 rounded border border-border/40 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">Session ID:</span>
                      <span className="font-mono">
                        {session.id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={
                          session.isActive
                            ? 'text-green-600 font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        {session.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>
                        {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>
                        {new Date(session.expiresAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {debugInfo?.multiSessionError && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
          <p className="font-medium">Multi-Session Error:</p>
          <p className="text-sm">{String(debugInfo.multiSessionError)}</p>
        </div>
      )}
    </div>
  );
}
