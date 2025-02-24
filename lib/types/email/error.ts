/**
 * Base class for email-related errors
 * @class
 * @extends Error
 */
export class EmailError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

/**
 * Error thrown when email rate limits are exceeded
 * @class
 * @extends EmailError
 */
export class EmailRateLimitError extends EmailError {
  constructor(message: string) {
    super(message);
    this.name = 'EmailRateLimitError';
  }
}

/**
 * Error thrown when email delivery fails
 * @class
 * @extends EmailError
 */
export class EmailDeliveryError extends EmailError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'EmailDeliveryError';
  }
}
