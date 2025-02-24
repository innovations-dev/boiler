import { SiteFooter } from '../_components/footer';
import { SiteHeader } from '../_components/header';
import { MDXLayout } from '../_components/mdx-layout';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <MDXLayout>
        <main className="flex-1">{children}</main>
      </MDXLayout>
      <SiteFooter />
    </div>
  );
}
