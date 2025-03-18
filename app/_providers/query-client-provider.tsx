'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';

import { logger } from '@/lib/logger';

interface QueryErrorType {
  message: string;
  statusCode?: number;
  code?: string;
}

// interface QueryMetaType {
//   queryKey?: unknown[];
//   mutationKey?: unknown[];
// }

/**
 * Creates a query client with default error handling and logging
 */
export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
      mutations: {
        retry: 0,
      },
    },
  });

  // Add global error handler
  function handleError(error: unknown) {
    const queryError = error as QueryErrorType;
    logger.error('Operation error occurred', {
      error: queryError,
      component: 'QueryClient',
      context: 'global-error-handler',
    });

    if (queryError?.message) {
      toast.error(queryError.message);
    }
  }

  // Add global success logger
  function handleSuccess() {
    logger.debug('Operation completed successfully', {
      component: 'QueryClient',
      context: 'global-success-handler',
    });
  }

  // Set up global listeners
  client.getQueryCache().subscribe(() => ({
    onError: handleError,
    onSuccess: handleSuccess,
  }));

  client.getMutationCache().subscribe(() => ({
    onError: handleError,
    onSuccess: handleSuccess,
  }));

  return client;
}

const queryClient = createQueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
