/**
 * @fileoverview Application-wide logging system with structured logging and error tracking.
 * This module provides a centralized logging service with support for different log levels,
 * structured metadata, and environment-aware logging behavior.
 *
 * Key features:
 * - Structured logging with metadata
 * - Error object serialization
 * - Environment-aware logging
 * - Log level support (debug, info, warn, error)
 * - Request context tracking
 *
 * @module lib/logger
 * @see {@link lib/errors} for error handling integration
 */

import { env } from '@/env';

/**
 * Supported log levels in order of severity
 * @enum {string}
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logging scope configuration
 * @interface LogScope
 */
interface LogScope {
  component?: string;
  context?: string;
}

/**
 * Configuration options for the logger
 * @interface LogConfig
 */
interface LogConfig {
  verbose: boolean;
  minimalMetadataKeys: string[];
  scopedVerbosity: Map<string, boolean>;
}

/**
 * Structure for log entries with metadata and error information
 *
 * @interface LogEntry
 * @property {string} level - Log level (debug, info, warn, error)
 * @property {string} message - Main log message
 * @property {Record<string, unknown>} metadata - Structured metadata for the log
 * @property {Object} [error] - Error information if present
 * @property {string} error.name - Error class name
 * @property {string} error.message - Error message
 * @property {string} [error.stack] - Error stack trace (in development)
 * @property {unknown} [error.cause] - Original error cause
 *
 * @example
 * ```typescript
 * const logEntry: LogEntry = {
 *   level: 'error',
 *   message: 'Failed to process request',
 *   metadata: {
 *     requestId: '123',
 *     userId: '456'
 *   },
 *   error: {
 *     name: 'ValidationError',
 *     message: 'Invalid input'
 *   }
 * };
 * ```
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

interface LogColors {
  level: Record<LogLevel, string>;
  message: string;
  metadata: string;
  error: string;
  reset: string;
}

/**
 * Singleton logger class that provides structured logging capabilities.
 * Uses environment variables to determine logging behavior and format.
 *
 * Features:
 * - Singleton pattern ensures consistent logging across the application
 * - Environment-aware logging behavior
 * - Structured log formatting
 * - Error object handling
 * - Log level filtering
 *
 * @class Logger
 *
 * @example
 * ```typescript
 * // Basic logging
 * logger.info('User logged in', { userId: '123' });
 *
 * // Error logging
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logger.error('Operation failed', { operationId: '456' }, error);
 * }
 * ```
 */
class Logger {
  private static instance: Logger;
  private readonly isDevelopment: boolean;
  private config: LogConfig = {
    verbose: false,
    minimalMetadataKeys: ['component', 'context', 'id'],
    scopedVerbosity: new Map(),
  };

  private readonly colors: LogColors = {
    level: {
      debug: '\x1b[90m', // Gray
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    },
    message: '\x1b[37m', // White
    metadata: '\x1b[90m', // Gray
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
  };

  private constructor() {
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  /**
   * Gets the singleton logger instance
   * @returns {Logger} The logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Configure logger settings
   * @param {Partial<LogConfig>} config - Logger configuration options
   */
  public configure(config: Partial<LogConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      // Preserve the Map instance if not provided in config
      scopedVerbosity: config.scopedVerbosity || this.config.scopedVerbosity,
    };
  }

  /**
   * Enable or disable verbose logging globally
   * @param {boolean} enabled - Whether to enable verbose logging
   */
  public setVerbose(enabled: boolean): void {
    this.config.verbose = enabled;
  }

  /**
   * Enable or disable verbose logging for a specific scope
   * @param {LogScope} scope - The scope to configure
   * @param {boolean} enabled - Whether to enable verbose logging for this scope
   */
  public setScopeVerbose(scope: LogScope, enabled: boolean): void {
    const scopeKey = this.getScopeKey(scope);
    this.config.scopedVerbosity.set(scopeKey, enabled);
  }

  /**
   * Reset verbosity settings for a specific scope
   * @param {LogScope} scope - The scope to reset
   */
  public resetScopeVerbosity(scope: LogScope): void {
    const scopeKey = this.getScopeKey(scope);
    this.config.scopedVerbosity.delete(scopeKey);
  }

  /**
   * Clear all scoped verbosity settings
   */
  public resetAllScopeVerbosity(): void {
    this.config.scopedVerbosity.clear();
  }

  /**
   * Generate a unique key for a scope
   * @private
   */
  private getScopeKey(scope: LogScope): string {
    return `${scope.component || '*'}:${scope.context || '*'}`;
  }

  /**
   * Check if verbose logging is enabled for a given metadata context
   * @private
   */
  private isVerboseEnabled(metadata: Record<string, unknown>): boolean {
    // Check scoped verbosity first
    const scope: LogScope = {
      component: metadata.component as string,
      context: metadata.context as string,
    };

    const scopeKey = this.getScopeKey(scope);
    const scopedSetting = this.config.scopedVerbosity.get(scopeKey);

    // If scope-specific setting exists, use it
    if (typeof scopedSetting === 'boolean') {
      return scopedSetting;
    }

    // Fall back to global setting
    return this.config.verbose;
  }

  /**
   * Formats an error object for logging
   * Handles different error types and extracts relevant information
   *
   * @private
   * @param {unknown} error - Error to format
   * @returns {LogEntry['error']} Formatted error object
   */
  private formatError(error: unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        cause: error.cause,
      };
    }
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  /**
   * Filters metadata based on verbosity settings
   * @private
   */
  private filterMetadata(
    metadata: Record<string, unknown>
  ): Record<string, unknown> {
    if (this.isVerboseEnabled(metadata)) {
      return metadata;
    }

    return Object.fromEntries(
      Object.entries(metadata).filter(([key]) =>
        this.config.minimalMetadataKeys.includes(key)
      )
    );
  }

  private formatMetadata(metadata: Record<string, unknown>): string {
    const filteredMetadata = this.filterMetadata(metadata);
    return Object.keys(filteredMetadata).length > 0
      ? JSON.stringify(filteredMetadata, null, 2)
      : '';
  }

  private getColorByLevel(level: LogLevel): string {
    return this.colors.level[level];
  }

  private formatTimestamp(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Creates and outputs a log entry
   *
   * @private
   * @param {LogEntry} entry - Log entry to output
   */
  private log(entry: LogEntry): void {
    const timestamp = this.formatTimestamp();
    const levelColor = this.getColorByLevel(entry.level);
    const formattedMetadata = this.formatMetadata(entry.metadata);

    if (this.isDevelopment) {
      // Development: Colorized, human-readable output
      const levelStr = `${levelColor}[${entry.level.toUpperCase()}]${this.colors.reset}`;
      const messageStr = `${this.colors.message}${entry.message}${this.colors.reset}`;

      // Minimal output for non-verbose info logs
      if (entry.level === 'info' && !this.isVerboseEnabled(entry.metadata)) {
        console.log(
          `${timestamp} ${levelStr} ${messageStr}${
            formattedMetadata
              ? ` ${this.colors.metadata}${formattedMetadata}${this.colors.reset}`
              : ''
          }`
        );
        return;
      }

      // Full output for other levels or verbose mode
      console.log(
        `${timestamp} ${levelStr} ${messageStr}${
          formattedMetadata
            ? `\n${this.colors.metadata}${formattedMetadata}${this.colors.reset}`
            : ''
        }${
          entry.error
            ? `\n${this.colors.error}Error: ${entry.error.message}${
                entry.error.stack ? `\n${entry.error.stack}` : ''
              }${this.colors.reset}`
            : ''
        }`
      );
    } else {
      // Production: JSON output with filtered metadata
      console.log(
        JSON.stringify({
          timestamp,
          level: entry.level,
          message: entry.message,
          ...this.filterMetadata(entry.metadata),
          ...(entry.error && { error: entry.error }),
        })
      );
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - Log message
   * @param {Record<string, unknown>} metadata - Additional structured data
   */
  public debug(message: string, metadata: Record<string, unknown> = {}): void {
    if (this.isDevelopment) {
      this.log({ level: 'debug', message, metadata });
    }
  }

  /**
   * Logs an info message
   * @param {string} message - Log message
   * @param {Record<string, unknown>} metadata - Additional structured data
   */
  public info(message: string, metadata: Record<string, unknown> = {}): void {
    this.log({ level: 'info', message, metadata });
  }

  /**
   * Logs a warning message
   * @param {string} message - Log message
   * @param {Record<string, unknown>} metadata - Additional structured data
   */
  public warn(message: string, metadata: Record<string, unknown> = {}): void {
    this.log({ level: 'warn', message, metadata });
  }

  /**
   * Logs an error message with error details
   * @param {string} message - Log message
   * @param {Record<string, unknown>} metadata - Additional structured data
   * @param {unknown} [error] - Error object to log
   */
  public error(
    message: string,
    metadata: Record<string, unknown> = {},
    error?: unknown
  ): void {
    this.log({
      level: 'error',
      message,
      metadata,
      error: error ? this.formatError(error) : undefined,
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
