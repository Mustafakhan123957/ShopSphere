import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// AppError — custom error class carrying an HTTP status code
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);

    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Global error-handler middleware
// ---------------------------------------------------------------------------

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : 'An unexpected internal server error occurred.';

  const responseBody: ErrorResponseBody = {
    success: false,
    message,
  };

  // In development, include the stack trace for easier debugging
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  // Log the full error on the server regardless of environment
  console.error(`[ERROR] ${statusCode} — ${err.message}`);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json(responseBody);
};
