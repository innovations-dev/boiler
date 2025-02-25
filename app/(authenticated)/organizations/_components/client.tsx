'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useCreateOrganization,
  useUserOrganizations,
} from '@/hooks/organizations/use-organization';
import { useSession } from '@/lib/auth/client';
import type { Organization } from '@/lib/db/_schema';

interface OrganizationTestClientProps {
  initialOrganizations: Organization[];
}

export function OrganizationTestClient({
  initialOrganizations,
}: OrganizationTestClientProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const { data: organizations } = useUserOrganizations(session?.user?.id ?? '');
  const createOrg = useCreateOrganization();

  const handleCreate = () => {
    if (!session?.user?.id) return;
    createOrg.mutate({
      name,
      userId: session.user.id,
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization Name"
          />
          <Button onClick={handleCreate} disabled={createOrg.isPending}>
            {createOrg.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(organizations ?? initialOrganizations)?.map((org) => (
              <div key={org.id} className="p-4 border rounded">
                <h3 className="font-medium">{org.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {org.id}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
