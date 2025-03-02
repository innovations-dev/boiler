// app/(dashboard)/organizations/[slug]/settings/components/organization-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Organization } from '@/lib/better-auth/organization';
import {
  organizationSettingsSchema,
  type OrganizationSettings,
} from '@/lib/db/_schema';
import { useUpdateOrganization } from '@/lib/hooks/organizations/use-better-auth-organization';

interface OrganizationFormProps {
  organization: Organization;
}

export function OrganizationForm({ organization }: OrganizationFormProps) {
  console.log('Organization form initialized with:', {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
  });

  const form = useForm<OrganizationSettings>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug || '',
      logo: organization.logo || null,
    } as OrganizationSettings,
  });

  const updateOrganization = useUpdateOrganization();

  const onSubmit = async (data: OrganizationSettings) => {
    console.log('Submitting organization form with data:', data);

    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        name: data.name,
        slug: data.slug,
        logo: data.logo || undefined,
      });

      console.log('Organization settings updated successfully');
      toast.success('Organization settings updated');
    } catch (error) {
      console.error('Error updating organization settings:', error);
      toast.error('Failed to update organization settings');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Logo</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChangeAction={(value) => field.onChange(value)}
                  onRemoveAction={() => field.onChange(null)}
                  disabled={updateOrganization.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateOrganization.isPending}>
          {updateOrganization.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
