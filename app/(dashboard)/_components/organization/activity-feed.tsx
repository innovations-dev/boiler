'use client';

/**
 * @fileoverview Organization activity feed component
 *
 * This component displays a feed of organization activities.
 * It uses the organization activity service to fetch activities
 * and displays them in a timeline format.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  Edit,
  FolderPlus,
  RefreshCw,
  Settings,
  Trash,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';

import { useOrganization } from '@/app/(dashboard)/_context/organization-context';
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
import {
  OrganizationActivity,
  OrganizationActivityType,
} from '@/lib/domains/organization/types';
import { queryKeys } from '@/lib/query/keys';

/**
 * Activity feed component props
 */
interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

/**
 * Organization activity feed component
 */
export function ActivityFeed({ className, limit = 10 }: ActivityFeedProps) {
  const { organization } = useOrganization();
  const [displayLimit, setDisplayLimit] = useState(limit);

  // Fetch organization activities
  const {
    data: activities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      ...queryKeys.organizations.extensions.activity(organization.id),
      displayLimit,
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organization.id}/activity?limit=${displayLimit}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch organization activities');
      }

      return response.json() as Promise<OrganizationActivity[]>;
    },
    enabled: !!organization.id,
  });

  // Handle load more
  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 10);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Recent activities in your organization
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            title="Refresh activities"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-1">
        {isLoading ? (
          <ActivityFeedSkeleton count={5} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">Failed to load activities</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : 'An unknown error occurred'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No activities yet</h3>
            <p className="text-sm text-muted-foreground">
              Activities will appear here as your team uses the organization.
            </p>
          </div>
        )}
      </CardContent>
      {activities && activities.length >= displayLimit && (
        <CardFooter className="pt-2">
          <Button variant="outline" className="w-full" onClick={handleLoadMore}>
            Load More
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Activity item component
 */
function ActivityItem({ activity }: { activity: OrganizationActivity }) {
  // Format the activity date
  const formattedDate = formatRelativeTime(new Date(activity.createdAt));

  // Get the activity icon and color based on the activity type
  const {
    icon: ActivityIcon,
    color,
    label,
  } = getActivityTypeInfo(activity.type);

  return (
    <div className="flex items-start gap-4">
      <div className={`rounded-full p-2 ${color} shrink-0`}>
        <ActivityIcon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{label}</p>
          <time
            className="text-xs text-muted-foreground"
            title={formatDate(new Date(activity.createdAt))}
          >
            {formattedDate}
          </time>
        </div>
        <ActivityDetails activity={activity} />
      </div>
    </div>
  );
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Activity details component
 */
function ActivityDetails({ activity }: { activity: OrganizationActivity }) {
  switch (activity.type) {
    case OrganizationActivityType.ORGANIZATION_UPDATED:
      return (
        <p className="text-sm text-muted-foreground">
          Organization details were updated
          {activity.details?.changes && (
            <span className="block mt-1">
              Changed: {Object.keys(activity.details.changes).join(', ')}
            </span>
          )}
        </p>
      );

    case OrganizationActivityType.MEMBER_ADDED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.memberEmail && (
            <>
              <span className="font-medium">
                {activity.details.memberEmail}
              </span>{' '}
              was added as a{' '}
              <Badge variant="outline">
                {activity.details.role || 'member'}
              </Badge>
            </>
          )}
        </p>
      );

    case OrganizationActivityType.MEMBER_REMOVED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.memberEmail && (
            <>
              <span className="font-medium">
                {activity.details.memberEmail}
              </span>{' '}
              was removed from the organization
            </>
          )}
        </p>
      );

    case OrganizationActivityType.MEMBER_ROLE_UPDATED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.memberEmail && (
            <>
              <span className="font-medium">
                {activity.details.memberEmail}
              </span>
              's role was updated to{' '}
              <Badge variant="outline">
                {activity.details.newRole || 'unknown'}
              </Badge>
            </>
          )}
        </p>
      );

    case OrganizationActivityType.WORKSPACE_CREATED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.workspaceName ? (
            <>
              Workspace{' '}
              <span className="font-medium">
                {activity.details.workspaceName}
              </span>{' '}
              was created
            </>
          ) : (
            'A new workspace was created'
          )}
        </p>
      );

    case OrganizationActivityType.WORKSPACE_UPDATED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.workspaceName ? (
            <>
              Workspace{' '}
              <span className="font-medium">
                {activity.details.workspaceName}
              </span>{' '}
              was updated
            </>
          ) : (
            'A workspace was updated'
          )}
        </p>
      );

    case OrganizationActivityType.WORKSPACE_DELETED:
      return (
        <p className="text-sm text-muted-foreground">
          {activity.details?.workspaceName ? (
            <>
              Workspace{' '}
              <span className="font-medium">
                {activity.details.workspaceName}
              </span>{' '}
              was deleted
            </>
          ) : (
            'A workspace was deleted'
          )}
        </p>
      );

    default:
      return <p className="text-sm text-muted-foreground">Unknown activity</p>;
  }
}

/**
 * Activity feed skeleton component
 */
function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
/**
 * Get activity type information (icon, color, label)
 */
function getActivityTypeInfo(type: OrganizationActivityType) {
  switch (type) {
    case OrganizationActivityType.ORGANIZATION_UPDATED:
      return {
        icon: Settings,
        color: 'bg-blue-500',
        label: 'Organization Updated',
      };

    case OrganizationActivityType.MEMBER_ADDED:
      return {
        icon: UserPlus,
        color: 'bg-green-500',
        label: 'Member Added',
      };

    case OrganizationActivityType.MEMBER_REMOVED:
      return {
        icon: UserMinus,
        color: 'bg-red-500',
        label: 'Member Removed',
      };

    case OrganizationActivityType.MEMBER_ROLE_UPDATED:
      return {
        icon: Users,
        color: 'bg-amber-500',
        label: 'Role Updated',
      };

    case OrganizationActivityType.WORKSPACE_CREATED:
      return {
        icon: FolderPlus,
        color: 'bg-green-500',
        label: 'Workspace Created',
      };

    case OrganizationActivityType.WORKSPACE_UPDATED:
      return {
        icon: Edit,
        color: 'bg-blue-500',
        label: 'Workspace Updated',
      };

    case OrganizationActivityType.WORKSPACE_DELETED:
      return {
        icon: Trash,
        color: 'bg-red-500',
        label: 'Workspace Deleted',
      };

    default:
      return {
        icon: Activity,
        color: 'bg-gray-500',
        label: 'Activity',
      };
  }
}
