import { Metadata } from 'next';

import { ShellWithSidebar } from '@/app/_components/root-layout/shell-with-sidebar';
import { Container } from '@/components/container';
import { generateMetadata } from '@/config/meta.config';

import { SiteFooter } from '../_components/footer';
import { SiteHeader } from '../_components/header';
// import { DocsBreadcrumbs } from './_components/docs-breadcrumbs';
import { DocsNavigation } from './_components/docs-navigation';

// import { getDocsConfig } from './_utils/generate-nav-config';

export const metadata: Metadata = await generateMetadata({
  title: 'Nextjs v15 Boilerplate Documentation',
  description:
    'Get started quickly with the Nextjs v15 Boilerplate. A modern, production-ready boilerplate for building web applications with Next.js 15.',
});

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <ShellWithSidebar
      header={<SiteHeader />}
      sidebar={<DocsNavigation />}
      footer={<SiteFooter />}
    >
      <Container>
        <div className="mx-auto max-w-[880px] py-6 lg:py-10">{children}</div>
      </Container>
    </ShellWithSidebar>
  );
}
