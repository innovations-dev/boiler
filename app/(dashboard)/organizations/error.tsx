'use client';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';

/**
 * Organizations error boundary
 *
 * This component handles errors that occur in the organizations routes.
 */
export default function OrganizationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} resetAction={reset} variant="default" />;
}
