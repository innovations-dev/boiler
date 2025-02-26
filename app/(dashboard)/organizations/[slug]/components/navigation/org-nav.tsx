'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { BarChart3, Settings } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function OrganizationNav() {
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const routes = [
    {
      href: `/organizations/${slug}`,
      label: 'Dashboard',
      icon: BarChart3,
      active: pathname === `/organizations/${slug}`,
    },
    {
      href: `/organizations/${slug}/settings`,
      label: 'Settings',
      icon: Settings,
      active: pathname.includes(`/organizations/${slug}/settings`),
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 px-4 py-2 border-b">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            route.active
              ? 'bg-muted hover:bg-muted text-primary'
              : 'text-muted-foreground hover:text-primary hover:bg-transparent',
            'justify-start'
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
