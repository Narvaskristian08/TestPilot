import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;
  metadata?: any;

  constructor(message: string, statusCode: number, errorCode?: string, metadata?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    const response: any = {
      status: 'error',
      message: err.message,
    };

    if (err.errorCode) {
      response.error = err.errorCode;
    }

    if (err.metadata) {
      response.data = err.metadata;
    }

    return res.status(err.statusCode).json(response);
  }

  // Unexpected errors
  console.error('Unexpected error:', err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
