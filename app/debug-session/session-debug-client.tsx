'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface SessionDebugClientProps {
  className?: string;
}

export function SessionDebugClient({ className }: SessionDebugClientProps) {
  const [clientInfo, setClientInfo] = useState<{
    cookies: string[];
    hasSessionCookie: boolean;
    sessionCookieName?: string;
    localStorage: Record<string, string>;
    error?: string;
  }>({
    cookies: [],
    hasSessionCookie: false,
    localStorage: {},
  });

  const [isLoading, setIsLoading] = useState(false);

  // Function to refresh client-side debug info
  const refreshDebugInfo = () => {
    setIsLoading(true);
    try {
      // Get all cookies
      const allCookies = document.cookie.split(';').map((c) => c.trim());

      // Check for session cookie
      const sessionCookie = allCookies.find((cookie) =>
        cookie.startsWith('better-auth.session_token')
      );

      // Get localStorage items
      const localStorageItems: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            localStorageItems[key] = value || '';
          } catch (e) {
            localStorageItems[key] = 'Error reading value';
          }
        }
      }

      setClientInfo({
        cookies: allCookies,
        hasSessionCookie: !!sessionCookie,
        sessionCookieName: sessionCookie?.split('=')[0],
        localStorage: localStorageItems,
      });
    } catch (error) {
      setClientInfo((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    refreshDebugInfo();
  }, []);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Client-Side Session Info</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshDebugInfo}
          disabled={isLoading}
          className="border-border/60"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {clientInfo.error && (
        <div className="bg-red-100 p-3 rounded-md mb-4 text-red-800 border border-red-200">
          {clientInfo.error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium mb-2">Cookies</h4>
          <div className="bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="font-medium">Has Session Cookie:</div>
              <div
                className={
                  clientInfo.hasSessionCookie
                    ? 'text-green-600 font-medium'
                    : 'text-red-600'
                }
              >
                {clientInfo.hasSessionCookie ? 'Yes' : 'No'}
              </div>

              {clientInfo.sessionCookieName && (
                <>
                  <div className="font-medium">Session Cookie Name:</div>
                  <div className="truncate text-blue-600 font-mono">
                    {clientInfo.sessionCookieName}
                  </div>
                </>
              )}

              <div className="font-medium">Total Cookies:</div>
              <div>{clientInfo.cookies.length}</div>
            </div>

            {clientInfo.cookies.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">All Cookies:</div>
                <div className="bg-background/60 p-2 rounded-md overflow-auto max-h-40 border border-border/40">
                  <ul className="list-disc list-inside">
                    {clientInfo.cookies.map((cookie, index) => (
                      <li
                        key={index}
                        className={`truncate text-sm ${
                          cookie.includes('better-auth')
                            ? 'text-blue-600 font-medium'
                            : 'text-foreground/80'
                        }`}
                      >
                        {cookie.includes('=') ? cookie.split('=')[0] : cookie}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Local Storage</h4>
          <div className="bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
            {Object.keys(clientInfo.localStorage).length > 0 ? (
              <div className="overflow-auto max-h-40">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-2 px-3 font-medium">Key</th>
                      <th className="text-left py-2 px-3 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(clientInfo.localStorage)
                      .filter(
                        ([key]) =>
                          key.includes('auth') || key.includes('session')
                      )
                      .map(([key, value]) => (
                        <tr key={key} className="border-b border-border/40">
                          <td className="py-2 px-3 truncate max-w-[150px] font-mono text-blue-600">
                            {key}
                          </td>
                          <td className="py-2 px-3 truncate max-w-[200px] text-foreground/80">
                            {value.length > 50
                              ? `${value.substring(0, 50)}...`
                              : value}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">
                No auth-related localStorage items found
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Test Actions</h4>
          <div className="bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('/api/test-session', '_blank');
                }}
                className="border-border/60 mr-2"
              >
                Test Session Validation
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('/api/auth-inspect', '_blank');
                }}
                className="border-border/60"
              >
                Inspect Session Structure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
