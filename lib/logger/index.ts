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
   * Creates and outputs a log entry
   *
   * @private
   * @param {LogEntry} entry - Log entry to output
   */
  private log(entry: LogEntry): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: entry.level,
      message: entry.message,
      ...entry.metadata,
      ...(entry.error && { error: entry.error }),
    };

    // In development, use formatted console output
    if (this.isDevelopment) {
      const color = this.getLogColor(entry.level);
      console.log(
        `%c${timestamp} [${entry.level.toUpperCase()}] ${entry.message}`,
        `color: ${color}`,
        entry.metadata,
        entry.error || ''
      );
      return;
    }

    // In production, output structured JSON
    console.log(JSON.stringify(logData));
  }

  /**
   * Gets the console color for different log levels
   *
   * @private
   * @param {LogLevel} level - Log level
   * @returns {string} CSS color value
   */
  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '#808080'; // gray
      case 'info':
        return '#0066cc'; // blue
      case 'warn':
        return '#ff9900'; // orange
      case 'error':
        return '#cc0000'; // red
      default:
        return '#000000'; // black
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - Log message
   * @param {Record<string, unknown>} metadata - Additional structured data
   */
  public debug(message: string, metadata: Record<string, unknown> = {}): void {
    this.log({ level: 'debug', message, metadata });
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
