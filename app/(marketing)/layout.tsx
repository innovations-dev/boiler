import MainLayout from '../_components/root-layout/main-layout';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
