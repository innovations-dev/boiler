import { ScrollArea } from '@/components/ui/scroll-area';

export function ShellWithSidebar({
  header,
  sidebar,
  footer,
  children,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Dashboard header */}
      {header}

      {/* Main content area with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r bg-background md:block">
          <ScrollArea className="h-full px-4 py-6">{sidebar}</ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:pl-64">
          <div className="container py-6">{children}</div>
        </main>
      </div>

      {footer && <div className="md:pl-64">{footer}</div>}
    </div>
  );
}
