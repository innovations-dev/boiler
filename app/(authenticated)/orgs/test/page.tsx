import { getUserOrganizations } from '@/lib/db/queries/organizations';

import { OrganizationTestClient } from '../_components/client';

export default async function TestOrganizationsPage() {
  // Fetch initial data on the server
  const organizations = await getUserOrganizations('test-user');

  return <OrganizationTestClient initialOrganizations={organizations} />;
}
