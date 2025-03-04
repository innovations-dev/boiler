/**
 * @fileoverview Organization dashboard component
 *
 * This component displays the main dashboard for an organization.
 */

import { useOrganization } from '@/app/(dashboard)/_context/organization-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Organization dashboard component
 */
export function OrganizationDashboard() {
  const { organization } = useOrganization();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to {organization.name}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Organization ID: {organization.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
