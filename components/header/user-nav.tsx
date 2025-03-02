'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { navigationRoutes } from '@/config/routes.config';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

import { Spinner } from '../spinner';
import { Button, buttonVariants } from '../ui/button';

function UserNavContent({
  authenticated,
  unauthenticated,
}: {
  authenticated: typeof navigationRoutes.admin;
  unauthenticated: typeof navigationRoutes.admin;
}) {
  const { isPending, error, data: session } = authClient.useSession();
  const pathname = usePathname();

  const items = session ? authenticated : unauthenticated;

  if (isPending) {
    return <Spinner />;
  }

  if (error) {
    logger.error(
      'Error in UserNav',
      {
        component: 'UserNav',
      },
      error
    );
    toast.error(error?.message || 'Error');
    return <div>Error</div>;
  }

  if (!error && session?.session && session?.user) {
    const handleSignOut = async () => {
      try {
        await authClient.signOut();
      } catch (error) {
        logger.error(
          'Failed to sign out',
          {
            component: 'UserNav',
          },
          error
        );
        toast.error('Failed to sign out');
      }
    };

    return (
      <Button
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        onClick={handleSignOut}
      >
        Sign out
      </Button>
    );
  }

  return (
    <>
      {items?.length
        ? items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'ghost' }),
                pathname === item.href && 'bg-accent'
              )}
            >
              {item.name}
            </Link>
          ))
        : null}
    </>
  );
}

export function UserNav({
  authenticated,
  unauthenticated,
}: {
  authenticated: typeof navigationRoutes.admin;
  unauthenticated: typeof navigationRoutes.auth;
}) {
  return (
    <Suspense fallback={<Spinner />}>
      <UserNavContent
        authenticated={authenticated}
        unauthenticated={unauthenticated}
      />
    </Suspense>
  );
}
