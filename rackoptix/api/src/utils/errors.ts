/**
 * Custom error classes for the RackOptix API
 */

/**
 * Base error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for when a resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends ApiError {
  errors?: Record<string, string>;
  
  constructor(message: string = 'Validation failed', errors?: Record<string, string>) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Error for unauthorized access
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Error for forbidden access
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Error for conflict situations (e.g., duplicate resources)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Error for internal server errors
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Error for service unavailable situations
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service unavailable') {
    super(message, 503);
  }
}

/**
 * Error for bad gateway situations
 */
export class BadGatewayError extends ApiError {
  constructor(message: string = 'Bad gateway') {
    super(message, 502);
  }
}

/**
 * Error for gateway timeout situations
 */
export class GatewayTimeoutError extends ApiError {
  constructor(message: string = 'Gateway timeout') {
    super(message, 504);
  }
}