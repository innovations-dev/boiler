import { useQuery } from '@tanstack/react-query';

import { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { ERROR_CODES } from '@/lib/types/responses/error';

interface ActiveSessionsResponse {
  activeSessions: number;
  lastActivityAt: string;
}

async function fetchActiveSessions(
  slug: string
): Promise<ActiveSessionsResponse> {
  const response = await fetch(`/api/organizations/${slug}/active-sessions`);
  if (!response.ok) {
    throw new AppError('Failed to fetch active sessions', {
      code: ERROR_CODES.BAD_REQUEST,
      status: response.status,
    });
  }
  return response.json();
}

export function useActiveSessions(slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.metrics.activeSessions(slug),
    queryFn: () => fetchActiveSessions(slug),
    // Refresh every 30 seconds
    refetchInterval: 30 * 1000,
    // Don't refetch in background
    refetchIntervalInBackground: false,
    // Still use window focus refetch
    refetchOnWindowFocus: true,
    // Keep data fresh for 15 seconds
    staleTime: 15 * 1000,
  });
}
