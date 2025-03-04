'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth/client';
import type { Organization } from '@/lib/better-auth/organization';
import {
  useCreateOrganization,
  useOrganizations,
} from '@/lib/hooks/organizations/use-better-auth-organization';
import { slugify } from '@/lib/utils';

interface OrganizationTestClientProps {
  initialOrganizations: Organization[];
}

export function OrganizationTestClient({
  initialOrganizations,
}: OrganizationTestClientProps) {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const { data: organizations, isError: orgLoadError } = useOrganizations();
  const createOrg = useCreateOrganization();

  const handleCreate = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create an organization');
      return;
    }

    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      createOrg.mutate(
        {
          name,
          slug: slugify(name),
        },
        {
          onError: (error) => {
            console.error('Failed to create organization:', error);
            toast.error('Failed to create organization. Please try again.');
          },
          onSuccess: () => {
            setName('');
            toast.success('Organization created successfully!');
          },
        }
      );
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An unexpected error occurred');
    }
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
            disabled={createOrg.isPending}
          />
          <Button
            onClick={handleCreate}
            disabled={createOrg.isPending || !name.trim()}
          >
            {createOrg.isPending ? 'Creating...' : 'Create Organization'}
          </Button>
          {createOrg.isError && (
            <p className="text-sm text-red-500">
              Error creating organization. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {orgLoadError && (
            <p className="text-sm text-red-500 mb-4">
              Error loading organizations. Please refresh the page.
            </p>
          )}
          <div className="space-y-2">
            {(organizations ?? initialOrganizations)?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don't have any organizations yet.
              </p>
            ) : (
              (organizations ?? initialOrganizations)?.map((org) => (
                <div key={org.id} className="p-4 border rounded">
                  <h3 className="font-medium">{org.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {org.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Slug: {org.slug || 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
