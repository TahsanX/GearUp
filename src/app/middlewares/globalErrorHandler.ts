import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../../errors/AppError.js';
import { handleZodError } from '../../errors/handleZodError.js';
import { config } from '../../config/index.js';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorDetails: unknown = undefined;

  if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorDetails = simplified.errorDetails;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate value for field: ${(err.meta?.target as string[])?.join(', ')}`;
      errorDetails = err.meta;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
      errorDetails = err.meta;
    } else {
      statusCode = 400;
      message = err.message;
      errorDetails = err.meta;
    }
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = config.env === 'development' ? err.stack : undefined;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: errorDetails ?? null,
  });
};
