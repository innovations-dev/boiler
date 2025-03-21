import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

import tailwindConfig from '@/tailwind.config';

interface InvitationEmailProps {
  url: string;
  organizationName: string;
  invitedByUsername: string;
}

export default function InvitationEmail({
  url,
  organizationName,
  invitedByUsername,
}: InvitationEmailProps) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

  return (
    <Html>
      <Head />
      <Preview>Invitation to join {organizationName}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="mx-auto my-[40px] w-full max-w-3xl rounded border border-solid border-[#eaeaea] bg-white p-5">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/logo.png`}
                width="40"
                height="40"
                alt="Logo"
                className="mx-auto"
              />
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-[#484848]">
              Invitation to join {organizationName}
            </Heading>

            <Text className="m-0 mb-4 text-center text-base leading-[24px] text-[#484848]">
              You have been invited to join {organizationName} by{' '}
              {invitedByUsername}.
            </Text>

            <Text className="m-0 mb-4 text-center text-base leading-[24px] text-[#484848]">
              Click the button below to accept the invitation. This link will
              expire in 48 hours.
            </Text>

            <Section className="mb-8 text-center">
              <Link
                href={url}
                className="inline-block rounded bg-[#0070f3] px-6 py-3 text-center text-base font-semibold text-white no-underline"
              >
                Accept Invitation
              </Link>
            </Section>

            <Text className="m-0 text-center text-sm text-[#666666]">
              If you didn't request this, you can safely ignore this email.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Section className="text-center">
              <Text className="m-0 text-[12px] leading-[24px] text-[#666666]">
                This email was intended for you. If you were not expecting this
                email, please contact support.
              </Text>
              <Text className="m-0 text-[12px] leading-[24px] text-[#666666]">
                <Link href={`${baseUrl}`} className="text-[#666666] underline">
                  Your Company, Inc
                </Link>
                {' • '}
                <Link
                  href={`${baseUrl}/privacy`}
                  className="text-[#666666] underline"
                >
                  Privacy Policy
                </Link>
                {' • '}
                <Link
                  href={`${baseUrl}/terms`}
                  className="text-[#666666] underline"
                >
                  Terms of Service
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export const getInvitationEmail = async (
  url: string,
  organizationName: string,
  invitedByUsername: string
) => {
  return await render(
    <InvitationEmail
      url={url}
      organizationName={organizationName}
      invitedByUsername={invitedByUsername}
    />,
    { pretty: true }
  );
};
