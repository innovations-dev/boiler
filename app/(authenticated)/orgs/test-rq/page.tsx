// app/(authenticated)/organizations/test-rq/page.tsx
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

export default function TestReactQueryPage() {
  const { data: session } = useSession();
  const [name, setName] = useState('');

  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    error: orgsError,
  } = useUserOrganizations(session?.user?.id ?? '');

  const {
    mutate: createOrg,
    isPending: isCreating,
    error: createError,
  } = useCreateOrganization();

  const handleCreate = () => {
    if (!session?.user?.id) return;
    createOrg(
      {
        name,
        userId: session.user.id,
      },
      {
        onSuccess: () => {
          setName('');
        },
      }
    );
  };

  if (isLoadingOrgs) {
    return <div>Loading organizations...</div>;
  }

  if (orgsError || createError) {
    return <div>Error: {(orgsError || createError)?.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Organization (React Query)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organization Name"
          />
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Organization'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Organizations (React Query)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {organizations?.map((org) => (
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
