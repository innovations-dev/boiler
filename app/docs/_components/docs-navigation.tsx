import { Suspense } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import { getNavConfig } from '../_utils/generate-nav-config';
import { NavItems } from './nav-items';

// Server Component
async function NavigationContent() {
  const config = await getNavConfig();

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="flex flex-col gap-4">
          <NavItems items={config.sidebarNav} />
        </div>
      </ScrollArea>
    </div>
  );
}

// Client Component Wrapper
export function DocsNavigation() {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <NavigationContent />
    </Suspense>
  );
}

function NavigationSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-[80%] animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-[60%] animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
