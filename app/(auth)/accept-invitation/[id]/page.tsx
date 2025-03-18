import { Metadata } from 'next';

import { AcceptInvitationClient } from './accept-invitation-client';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Accept Invitation',
};

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { id } = await params;
  return <AcceptInvitationClient invitationId={id} />;
}
