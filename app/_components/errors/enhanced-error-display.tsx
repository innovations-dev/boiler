'use client';

import { AlertCircle, AlertTriangle, Ban, Info, RefreshCw } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ERROR_CODES, type ErrorResponse } from '@/lib/types/responses/error';

interface EnhancedErrorDisplayProps {
  /** The error to display */
  error: ErrorResponse;
  /** Title override (defaults to error-specific title) */
  title?: string;
  /** Description override (defaults to error message) */
  description?: string;
  /** Whether to show technical details (default: false) */
  showDetails?: boolean;
  /** Visual variant of the error component */
  variant?: 'alert' | 'card' | 'inline';
  /** Action to retry/recover from the error */
  onRetry?: () => void;
  /** Action to dismiss the error */
  onDismiss?: () => void;
  /** Whether a retry is in progress */
  isRetrying?: boolean;
}

/**
 * Maps error codes to appropriate icons
 */
const ERROR_ICONS = {
  [ERROR_CODES.BAD_REQUEST]: <AlertCircle className="h-4 w-4" />,
  [ERROR_CODES.UNAUTHORIZED]: <Ban className="h-4 w-4" />,
  [ERROR_CODES.FORBIDDEN]: <Ban className="h-4 w-4" />,
  [ERROR_CODES.NOT_FOUND]: <AlertTriangle className="h-4 w-4" />,
  [ERROR_CODES.VALIDATION_ERROR]: <AlertCircle className="h-4 w-4" />,
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: <AlertCircle className="h-4 w-4" />,
  default: <AlertCircle className="h-4 w-4" />,
};

/**
 * Maps error codes to user-friendly titles
 */
const ERROR_TITLES = {
  [ERROR_CODES.BAD_REQUEST]: 'Invalid Request',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication Required',
  [ERROR_CODES.FORBIDDEN]: 'Access Denied',
  [ERROR_CODES.NOT_FOUND]: 'Not Found',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation Error',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'System Error',
  default: 'Error Occurred',
};

/**
 * Enhanced error display component with better user feedback and recovery options
 */
export function EnhancedErrorDisplay({
  error,
  title,
  description,
  showDetails = false,
  variant = 'alert',
  onRetry,
  onDismiss,
  isRetrying = false,
}: EnhancedErrorDisplayProps) {
  const errorIcon =
    ERROR_ICONS[error.code as keyof typeof ERROR_ICONS] || ERROR_ICONS.default;
  const errorTitle =
    title ||
    ERROR_TITLES[error.code as keyof typeof ERROR_TITLES] ||
    ERROR_TITLES.default;
  const errorDescription = description || error.message;

  // Technical details component
  const TechnicalDetails = showDetails ? (
    <Accordion type="single" collapsible className="w-full mt-2">
      <AccordionItem value="details" className="border-0">
        <AccordionTrigger className="p-0 text-xs flex items-center gap-1 h-auto">
          <Info className="h-3 w-3" />
          Technical details
        </AccordionTrigger>
        <AccordionContent>
          <div className="text-xs text-muted-foreground rounded-md bg-muted p-2 mt-2">
            <p>
              <strong>Error Code:</strong> {error.code}
            </p>
            <p>
              <strong>Status:</strong> {error.status}
            </p>
            {error.details && (
              <p>
                <strong>Details:</strong> {JSON.stringify(error.details)}
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : null;

  // Action buttons component
  const ActionButtons =
    onRetry || onDismiss ? (
      <div className="flex items-center gap-2 mt-2">
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1"
          >
            {isRetrying && <RefreshCw className="h-3 w-3 animate-spin" />}
            {isRetrying ? 'Retrying...' : 'Try again'}
          </Button>
        )}
      </div>
    ) : null;

  // Render different variants
  if (variant === 'card') {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {errorIcon}
            <AlertTitle>{errorTitle}</AlertTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AlertDescription>{errorDescription}</AlertDescription>
          {TechnicalDetails}
        </CardContent>

        {ActionButtons && (
          <CardFooter className="flex justify-end gap-2 pt-2">
            {ActionButtons}
          </CardFooter>
        )}
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="text-destructive text-sm flex items-start gap-1.5">
        {errorIcon}
        <div>
          <p className="font-medium">{errorTitle}</p>
          <p>{errorDescription}</p>
          {onRetry && (
            <Button
              variant="link"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="p-0 h-auto text-destructive underline"
            >
              {isRetrying ? 'Retrying...' : 'Try again'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default alert variant
  return (
    <Alert variant="destructive">
      {errorIcon}
      <AlertTitle>{errorTitle}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{errorDescription}</p>
        {TechnicalDetails}
        {ActionButtons}
      </AlertDescription>
    </Alert>
  );
}
