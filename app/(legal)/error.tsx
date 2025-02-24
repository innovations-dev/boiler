'use client';

import { ErrorBoundary } from '@/app/_components/errors/error-boundary';

export default function LegalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} resetAction={reset} variant="full" />;
}
