'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  RefreshCwIcon,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SessionTestResult {
  timestamp: string;
  cookies?: {
    count: number;
    names: string[];
    hasSessionCookie: boolean;
  };
  headers?: Record<string, string>;
  session?: {
    userId?: string;
    email?: string;
    sessionId?: string;
    expiresAt?: string;
    activeOrganizationId?: string | null;
    hasUser: boolean;
    hasSession: boolean;
  };
  multiSession?: {
    count: number;
    sessions: Array<{
      id: string;
      isActive: boolean;
      createdAt: string;
      expiresAt: string;
      userId: string;
    }>;
  };
  error?: string;
  multiSessionError?: string;
}

// Create custom badge components to avoid variant type issues
const SuccessBadge = ({ children }: { children: React.ReactNode }) => (
  <Badge
    variant="default"
    className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
  >
    {children}
  </Badge>
);

const ErrorBadge = ({ children }: { children: React.ReactNode }) => (
  <Badge variant="destructive" className="border border-red-300">
    {children}
  </Badge>
);

export function SessionTestClient() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    Record<string, SessionTestResult | null>
  >({
    authDebug: null,
    authTest: null,
    authInspect: null,
  });
  const [activeTab, setActiveTab] = useState('authDebug');
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${endpoint}`);
      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [endpoint.replace(/-/g, '')]: data,
      }));
    } catch (err) {
      setError(
        `Error fetching ${endpoint}: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchEndpoint('auth-debug'),
        fetchEndpoint('auth-test'),
        fetchEndpoint('auth-inspect'),
      ]);
    } catch (err) {
      setError(
        `Error testing endpoints: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch auth-debug on initial load
    fetchEndpoint('auth-debug');
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e: unknown) {
      console.error('Error formatting date', e);
      return dateString;
    }
  };

  const renderSessionStatus = (result: SessionTestResult | null) => {
    if (!result) return <Skeleton className="h-6 w-24" />;

    if (result.error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      );
    }

    const hasSession = result.session?.hasSession;
    const hasUser = result.session?.hasUser;

    return (
      <div className="flex items-center gap-2 mb-4">
        {hasSession ? (
          <SuccessBadge>Session Valid</SuccessBadge>
        ) : (
          <ErrorBadge>No Session</ErrorBadge>
        )}
        {hasUser && (
          <Badge variant="outline" className="bg-blue-50">
            User: {result.session?.email || 'Unknown'}
          </Badge>
        )}
      </div>
    );
  };

  const renderCookieInfo = (result: SessionTestResult | null) => {
    if (!result || !result.cookies) return <Skeleton className="h-20 w-full" />;

    return (
      <div className="space-y-2 bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Cookie Count:</span>
          <span className="text-sm">{result.cookies.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Session Cookie:</span>
          <Badge
            variant={result.cookies.hasSessionCookie ? 'outline' : 'secondary'}
            className={
              result.cookies.hasSessionCookie
                ? 'border-blue-300 text-blue-700'
                : ''
            }
          >
            {result.cookies.hasSessionCookie ? 'Present' : 'Missing'}
          </Badge>
        </div>
        {result.cookies.names && result.cookies.names.length > 0 && (
          <div>
            <span className="text-sm font-medium">Cookie Names:</span>
            <div className="mt-1 text-xs bg-background/60 p-2 rounded border border-border/40 overflow-auto max-h-24">
              {result.cookies.names.map((name, i) => (
                <div
                  key={i}
                  className={
                    name.includes('better-auth')
                      ? 'text-blue-600 font-medium'
                      : 'text-foreground/80'
                  }
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSessionDetails = (result: SessionTestResult | null) => {
    if (!result || !result.session) return <Skeleton className="h-40 w-full" />;
    if (!result.session.hasSession) {
      return (
        <Alert className="mb-4 border border-blue-200 bg-blue-50 text-blue-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No Active Session</AlertTitle>
          <AlertDescription>
            No valid session was found. Try signing in first.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-2 bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
        <div className="flex justify-between">
          <span className="text-sm font-medium">User ID:</span>
          <span className="text-sm font-mono">
            {result.session.userId || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Email:</span>
          <span className="text-sm">{result.session.email || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Session ID:</span>
          <span className="text-sm font-mono">
            {result.session.sessionId || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Expires:</span>
          <span className="text-sm">
            {formatDate(result.session.expiresAt)}
          </span>
        </div>
        {result.session.activeOrganizationId && (
          <div className="flex justify-between">
            <span className="text-sm font-medium">Active Org:</span>
            <span className="text-sm font-mono">
              {result.session.activeOrganizationId}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMultiSessionInfo = (result: SessionTestResult | null) => {
    if (!result || !result.multiSession) return null;

    return (
      <div>
        <h4 className="text-sm font-medium mb-2">Multi-Session Information</h4>
        <div className="bg-background/80 p-3 rounded-md border border-border/60 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Active Sessions:</span>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              {result.multiSession.count}
            </Badge>
          </div>

          {result.multiSession.sessions.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.multiSession.sessions.map((session, index) => (
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
                    <span>{new Date(session.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>{new Date(session.expiresAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sessions found</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full border-border/60 bg-background/90">
      <CardHeader>
        <CardTitle>Session Test Dashboard</CardTitle>
        <CardDescription>
          Test Better-Auth session validation in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 border border-red-300">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="authDebug"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="authDebug">Auth Debug</TabsTrigger>
            <TabsTrigger value="authTest">Auth Test</TabsTrigger>
            <TabsTrigger value="authInspect">Auth Inspect</TabsTrigger>
          </TabsList>

          <TabsContent value="authDebug" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Auth Debug Results</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEndpoint('auth-debug')}
                disabled={loading}
                className="border-border/60"
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {renderSessionStatus(results.authdebug)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Cookie Information</h4>
                {renderCookieInfo(results.authdebug)}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Session Details</h4>
                {renderSessionDetails(results.authdebug)}
              </div>
            </div>

            {renderMultiSessionInfo(results.authdebug)}
          </TabsContent>

          <TabsContent value="authTest" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Auth Test Results</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEndpoint('auth-test')}
                disabled={loading}
                className="border-border/60"
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {renderSessionStatus(results.authtest)}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Test Results</h4>
                {!results.authtest ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <pre className="text-xs bg-background/60 p-3 rounded overflow-auto max-h-60 border border-border/40">
                    {JSON.stringify(results.authtest, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authInspect" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Auth Inspect Results</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEndpoint('auth-inspect')}
                disabled={loading}
                className="border-border/60"
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            {!results.authinspect ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <pre className="text-xs bg-background/60 p-3 rounded overflow-auto max-h-96 border border-border/40">
                {JSON.stringify(results.authinspect, null, 2)}
              </pre>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          onClick={testAllEndpoints}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Test All Endpoints
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
