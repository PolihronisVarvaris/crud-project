import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: {
        code:    err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code:    'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
