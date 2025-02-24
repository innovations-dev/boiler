/**
 * @fileoverview Audit logging system for tracking important user and system actions
 */

import { logger } from '../logger';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'organization.create'
  | 'organization.update'
  | 'organization.delete'
  | 'organization.member.add'
  | 'organization.member.remove'
  | 'organization.member.role_change'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'settings.update'
  | 'api.key.create'
  | 'api.key.revoke';

export interface AuditMetadata {
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  oldValue?: unknown;
  newValue?: unknown;
  [key: string]: unknown;
}

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  status: 'success' | 'failure';
  actor: {
    id?: string;
    type: 'user' | 'system' | 'anonymous';
    organizationId?: string;
  };
  target?: {
    id: string;
    type: string;
  };
  metadata: AuditMetadata;
  error?: {
    message: string;
    code: string;
  };
}

class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  public log(
    action: AuditAction,
    metadata: AuditMetadata,
    error?: Error
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      status: error ? 'failure' : 'success',
      actor: {
        id: metadata.userId,
        type: metadata.userId ? 'user' : 'system',
        organizationId: metadata.organizationId,
      },
      ...(metadata.resourceId && {
        target: {
          id: metadata.resourceId,
          type: metadata.resourceType || 'unknown',
        },
      }),
      metadata: this.sanitizeMetadata(metadata),
      ...(error && {
        error: {
          message: error.message,
          code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        },
      }),
    };

    // Log using the main logger with audit context
    logger.info(`Audit: ${action}`, {
      component: 'audit',
      ...entry,
    });

    // TODO: Persist audit logs to database or external service
    // this.persistAuditLog(entry);
  }

  /**
   * Remove sensitive information from metadata
   */
  private sanitizeMetadata(metadata: AuditMetadata): AuditMetadata {
    const sanitized = { ...metadata };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    sensitiveFields.forEach((field) => {
      delete sanitized[field];
    });

    // Mask email addresses
    if (typeof sanitized.email === 'string') {
      const [username, domain] = sanitized.email.split('@');
      sanitized.email = `${username.slice(0, 3)}***@${domain}`;
    }

    return sanitized;
  }

  /**
   * Log user authentication events
   */
  public logAuth(
    action: Extract<AuditAction, 'user.login' | 'user.logout'>,
    metadata: AuditMetadata,
    error?: Error
  ): void {
    this.log(
      action,
      {
        ...metadata,
        resourceType: 'auth',
      },
      error
    );
  }

  /**
   * Log data modification events
   */
  public logDataChange(
    action: Extract<AuditAction, 'data.create' | 'data.update' | 'data.delete'>,
    metadata: AuditMetadata & {
      oldValue?: unknown;
      newValue?: unknown;
    },
    error?: Error
  ): void {
    this.log(
      action,
      {
        ...metadata,
        resourceType: 'data',
      },
      error
    );
  }

  /**
   * Log organization member events
   */
  public logOrgMemberChange(
    action: Extract<
      AuditAction,
      | 'organization.member.add'
      | 'organization.member.remove'
      | 'organization.member.role_change'
    >,
    metadata: AuditMetadata,
    error?: Error
  ): void {
    this.log(
      action,
      {
        ...metadata,
        resourceType: 'organization_member',
      },
      error
    );
  }
}

export const auditLogger = AuditLogger.getInstance();
