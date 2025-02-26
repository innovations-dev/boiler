import { notFound } from 'next/navigation';

import { Shell } from '@/components/shell';
import { getOrganization } from '@/lib/db/queries/organizations';

import { OrganizationForm } from '../components/settings/organization-form';

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  const organization = await getOrganization(slug);

  if (!organization) {
    notFound();
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization profile and preferences
          </p>
        </div>

        <OrganizationForm organization={organization} />
      </div>
    </Shell>
  );
}
