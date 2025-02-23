import { MDXLayout } from '@/app/_components/mdx-layout';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MDXLayout>{children}</MDXLayout>;
}
