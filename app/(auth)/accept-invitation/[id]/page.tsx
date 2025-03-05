'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckIcon, Loader2, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth/client';
import { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { ERROR_CODES } from '@/lib/types/responses/error';

import { InvitationError } from './invitation-error';
import { InvitationSkeleton } from './invitation-skeleton';

interface Invitation {
  organizationName: string;
  organizationSlug: string;
  inviterEmail: string;
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  email: string;
  expiresAt: Date;
  organizationId: string;
  role: string;
  inviterId: string;
}

export default function InvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const { data: invitation, isLoading: isLoadingInvitation } =
    useQuery<Invitation>({
      queryKey: queryKeys.org.invitations.get(params.id),
      queryFn: async () => {
        const response = await authClient.organization.getInvitation({
          query: { id: params.id },
        });
        if (!response.data) {
          throw new AppError('Failed to fetch invitation', {
            code: ERROR_CODES.BAD_REQUEST,
            status: 400,
          });
        }
        return response.data as Invitation;
      },
    });

  const { mutate: handleAccept, isPending: isAccepting } = useMutation({
    mutationFn: async () => {
      const response = await authClient.organization.acceptInvitation({
        invitationId: params.id,
      });
      if (!response.data) {
        throw new AppError('Failed to accept invitation', {
          code: ERROR_CODES.BAD_REQUEST,
          status: 400,
        });
      }
      return response.data;
    },
    onSuccess: () => {
      router.push('/dashboard');
      // Log the event
      console.log({
        type: 'organization_invitation_accepted',
        action: 'Joined organization',
        details: `Accepted invitation to join ${invitation?.organizationName}`,
        entityType: 'member',
        entityId: invitation?.id || '',
        organizationId: invitation?.organizationId || '',
        userId: session?.user.id || '',
      });
    },
  });

  const { mutate: handleReject, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      const response = await authClient.organization.rejectInvitation({
        invitationId: params.id,
      });
      if (!response.data) {
        throw new AppError('Failed to reject invitation', {
          code: ERROR_CODES.BAD_REQUEST,
          status: 400,
        });
      }
      return response.data;
    },
  });

  if (isLoadingInvitation) {
    return <InvitationSkeleton />;
  }

  if (!invitation) {
    return <InvitationError />;
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isPending = invitation.status === 'pending';
  const isAccepted = invitation.status === 'accepted';
  const isRejected = invitation.status === 'rejected';

  if (isExpired) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitation Expired</CardTitle>
          <CardDescription>This invitation is no longer valid.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please request a new invitation from the organization administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="space-y-4">
              <p>
                <strong>{invitation.inviterEmail}</strong> has invited you to
                join <strong>{invitation.organizationName}</strong>.
              </p>
              <p>
                This invitation was sent to <strong>{invitation.email}</strong>.
              </p>
            </div>
          )}
          {isAccepted && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-center text-2xl font-bold">
                Welcome to {invitation.organizationName}!
              </h2>
              <p className="text-center">
                You&apos;ve successfully joined the organization. We&apos;re
                excited to have you on board!
              </p>
            </div>
          )}
          {isRejected && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XIcon className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-center text-2xl font-bold">
                Invitation Declined
              </h2>
              <p className="text-center">
                You&apos;ve declined the invitation to join{' '}
                {invitation.organizationName}.
              </p>
            </div>
          )}
        </CardContent>
        {isPending && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleReject()}
              disabled={isRejecting || isAccepting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline'
              )}
            </Button>
            <Button
              onClick={() => handleAccept()}
              disabled={isRejecting || isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
