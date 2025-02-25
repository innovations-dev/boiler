import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

/**
 * Creates a test query client with disabled retries
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

/**
 * Renders a React component with all necessary providers for testing
 * @param ui Component to render
 * @returns Rendered component with testing utilities
 */
export function renderWithProviders(ui: ReactElement) {
  const testQueryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
    ),
    queryClient: testQueryClient,
  };
}
