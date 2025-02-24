'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * @fileoverview React component for handling and displaying route errors in Next.js applications.
 * This module provides a flexible error boundary component with multiple display variants
 * and automatic error logging.
 *
 * Key features:
 * - Multiple visual variants (default, card, full)
 * - Automatic error logging
 * - Special handling for API errors
 * - Customizable error messages
 * - Reset/retry functionality
 * - Accessible error presentation
 *
 * Common usage patterns:
 * 1. Basic Error Boundary:
 * ```typescript
 * // app/[locale]/error.tsx
 * export default function ErrorBoundary({
 *   error,
 *   reset,
 * }: {
 *   error: Error & { digest?: string };
 *   reset: () => void;
 * }) {
 *   return <RouteError error={error} reset={reset} />;
 * }
 * ```
 *
 * 2. Custom Error Page:
 * ```typescript
 * // app/[locale]/dashboard/error.tsx
 * export default function DashboardError({
 *   error,
 *   reset,
 * }: {
 *   error: Error;
 *   reset: () => void;
 * }) {
 *   return (
 *     <RouteError
 *       error={error}
 *       reset={reset}
 *       title="Dashboard Error"
 *       description="Unable to load dashboard data. Please try again."
 *       variant="card"
 *     />
 *   );
 * }
 * ```
 *
 * 3. Full-Screen Error:
 * ```typescript
 * // app/[locale]/checkout/error.tsx
 * export default function CheckoutError({
 *   error,
 *   reset,
 * }: {
 *   error: Error;
 *   reset: () => void;
 * }) {
 *   const handleReset = () => {
 *     // Clear cart state
 *     clearCart();
 *     // Reset error boundary
 *     reset();
 *   };
 *
 *   return (
 *     <RouteError
 *       error={error}
 *       reset={handleReset}
 *       title="Payment Failed"
 *       description="We couldn't process your payment. Please try again."
 *       variant="full"
 *     />
 *   );
 * }
 * ```
 *
 * Integration with Error Tracking:
 * ```typescript
 * import * as Sentry from "@sentry/nextjs";
 *
 * export default function ErrorBoundary({
 *   error,
 *   reset,
 * }: {
 *   error: Error;
 *   reset: () => void;
 * }) {
 *   useEffect(() => {
 *     // Report error to Sentry
 *     Sentry.captureException(error);
 *   }, [error]);
 *
 *   return (
 *     <RouteError
 *       error={error}
 *       reset={reset}
 *       title="Application Error"
 *       description="We've been notified and are looking into the issue."
 *     />
 *   );
 * }
 * ```
 */

/**
 * Props interface for the RouteError component.
 * Defines the configuration options for error display and handling.
 *
 * Common configurations:
 * 1. Basic Alert:
 * ```typescript
 * const props: RouteErrorProps = {
 *   error: new Error("Failed to load data"),
 *   reset: () => window.location.reload(),
 * };
 * ```
 *
 * 2. Custom Card Error:
 * ```typescript
 * const props: RouteErrorProps = {
 *   error: new ApiError("UNAUTHORIZED", "Session expired"),
 *   reset: () => signIn(),
 *   title: "Authentication Required",
 *   description: "Please sign in to continue.",
 *   variant: "card"
 * };
 * ```
 *
 * 3. Full-Screen Error:
 * ```typescript
 * const props: RouteErrorProps = {
 *   error: new Error("Database connection failed"),
 *   reset: () => reconnectDatabase(),
 *   title: "System Unavailable",
 *   description: "We're experiencing technical difficulties.",
 *   variant: "full"
 * };
 * ```
 *
 * @interface RouteErrorProps
 * @property {Error} error - The error object to display and log
 * @property {() => void} reset - Callback function to reset/retry the action
 * @property {string} [title] - Custom title for the error message
 * @property {string} [description] - Custom description for the error message
 * @property {"default" | "card" | "full"} [variant] - Visual style variant
 */
interface RouteErrorProps {
  /** The error object to display and log */
  error: Error;
  /** Callback function to reset/retry the action that caused the error */
  resetAction: () => void;
  /** Custom title for the error message (defaults to "Something went wrong!") */
  title?: string;
  /** Custom description for the error message (defaults to "An error occurred. Please try again.") */
  description?: string;
  /** Visual variant of the error component
   * - 'default': Shows as an alert banner with minimal styling
   * - 'card': Displays as a card with shadow and padding
   * - 'full': Full-screen centered error message with large text
   */
  variant?: 'default' | 'card' | 'full';
}

/**
 * A flexible error boundary component for displaying route errors with different visual styles.
 * Automatically logs errors and provides retry functionality.
 *
 * Features:
 * - Multiple visual variants
 * - Automatic error logging
 * - Special handling for API errors
 * - Customizable messages
 * - Reset/retry functionality
 * - Accessible error presentation
 *
 * Common use cases:
 * 1. Basic Route Error:
 * ```typescript
 * // app/error.tsx
 * export default function Error({
 *   error,
 *   reset,
 * }: {
 *   error: Error;
 *   reset: () => void;
 * }) {
 *   return <RouteError error={error} reset={reset} />;
 * }
 * ```
 *
 * 2. Protected Route Error:
 * ```typescript
 * // app/dashboard/error.tsx
 * export default function DashboardError({
 *   error,
 *   reset,
 * }: {
 *   error: Error;
 *   reset: () => void;
 * }) {
 *   const router = useRouter();
 *
 *   const handleReset = () => {
 *     if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
 *       router.push("/login");
 *     } else {
 *       reset();
 *     }
 *   };
 *
 *   return (
 *     <RouteError
 *       error={error}
 *       reset={handleReset}
 *       title="Access Denied"
 *       description="Please log in to view this page."
 *       variant="card"
 *     />
 *   );
 * }
 * ```
 *
 * 3. Form Submission Error:
 * ```typescript
 * // components/user-form.tsx
 * export function UserForm() {
 *   const [error, setError] = useState<Error | null>(null);
 *
 *   if (error) {
 *     return (
 *       <RouteError
 *         error={error}
 *         reset={() => setError(null)}
 *         title="Form Error"
 *         description="Unable to save changes. Please try again."
 *         variant="card"
 *       />
 *     );
 *   }
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @component
 * @param {RouteErrorProps} props - Component props
 * @returns {JSX.Element} The rendered error component
 */
export function RouteError({
  error,
  resetAction,
  title = 'Something went wrong!',
  description = 'An error occurred. Please try again.',
  variant = 'default',
}: RouteErrorProps) {
  useEffect(() => {
    const appError = handleUnknownError(error);
    logger.error(
      'Route error occurred',
      {
        component: 'RouteError',
        variant,
        errorCode: appError.code,
        errorStatus: appError.status,
        path: window.location.pathname,
      },
      error
    );
  }, [error, variant]);

  // TODO: Handle ApiError - Add error handling / logger
  // if (error instanceof ApiError) {
  //   return (
  //     <div className="flex h-full w-full flex-col items-center justify-center">
  //       <h2 className="text-2xl font-bold">{title}</h2>
  //       <p className="text-muted-foreground">{error.message}</p>
  //       <Button onClick={resetAction}>Try again</Button>
  //     </div>
  //   );
  // }

  if (variant === 'full') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {error.message || description}
          </p>
          <Button onClick={() => resetAction()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">
            {error.message || description}
          </p>
          <Button onClick={() => resetAction()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center gap-x-2">
        {error.message || description}
        <Button variant="outline" size="sm" onClick={() => resetAction()}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
