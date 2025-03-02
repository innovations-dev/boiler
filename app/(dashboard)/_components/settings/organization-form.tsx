// app/(dashboard)/organizations/[slug]/settings/components/organization-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateOrganizationSettingsAction } from '@/app/_actions/organizations';
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
import { useServerAction } from '@/hooks/actions/use-server-action';
import {
  Organization,
  organizationSettingsSchema,
  type OrganizationSettings,
} from '@/lib/db/_schema';

interface OrganizationFormProps {
  organization: Omit<Organization, 'slug'> & {
    slug: string | null;
    logo?: string | null;
    metadata?: string | null;
  };
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

  const { execute, isPending } = useServerAction({
    action: (data: OrganizationSettings) => {
      console.log('Submitting organization form with data:', data);
      return updateOrganizationSettingsAction(organization.slug || '', data);
    },
    onSuccess: () => {
      console.log('Organization settings updated successfully');
      toast.success('Organization settings updated');
    },
    onError: (error) => {
      console.error('Error updating organization settings:', error);
      toast.error('Failed to update organization settings');
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(execute)} className="space-y-8">
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
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
