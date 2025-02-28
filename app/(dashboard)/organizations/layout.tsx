import { redirect } from 'next/navigation';

import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const { hasAccess, session } = await getOrganizationAccess(params.slug);

  if (!session) {
    redirect('/sign-in?callbackUrl=/organizations/' + params.slug);
  }

  if (!hasAccess) {
    redirect('/organizations');
  }

  return (
    <div className="organization-layout">
      {/* Organization header, navigation, etc. */}
      <main>{children}</main>
    </div>
  );
}
