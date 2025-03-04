'use client';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';

/**
 * Organization detail error boundary
 *
 * This component handles errors that occur in the organization detail routes.
 */
export default function OrganizationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} resetAction={reset} variant="default" />;
}
