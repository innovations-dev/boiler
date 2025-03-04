import { Session } from 'better-auth';
import { UserWithRole } from 'better-auth/plugins';

import { organizationService } from '@/lib/better-auth/organization';
import { logger } from '@/lib/logger';

export async function customSession({
  user,
  session,
}: {
  user: UserWithRole;
  session: Session;
}) {
  logger.debug('customSession processing', {
    component: 'CustomSession',
    userId: user?.id,
    // Don't log the entire session object as it may contain sensitive data
  });
  try {
    const member = await organizationService.getActiveMember(user.id);
    const activeOrganizationId = member?.organizationId;

    // TODO: implement workspaces
    // const activeWorkspace = await getActiveWorkspace();
    logger.debug('updating session', {
      context: 'auth config',
      component: 'customSession',
      userId: user?.id,
      activeOrganizationId,
    });

    return {
      ...session,
      user,
      activeOrganizationId,
      // TODO: implement workspaces
      // activeWorkspaceId: activeWorkspace?.id, // TODO: is this correct?
    };
  } catch (error) {
    logger.error(
      'customSession error:',
      {
        component: 'CustomSession',
        userId: user?.id,
      },
      error
    );
    return {
      session,
      user,
      activeOrganizationId: null,
      // TODO: implement workspaces
      // activeWorkspaceId: null, // TODO: is this correct?
    };
  }
}
