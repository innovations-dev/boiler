'use client';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';

/**
 * Dashboard error boundary
 *
 * This component handles errors that occur in the dashboard routes.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} resetAction={reset} variant="default" />;
}
