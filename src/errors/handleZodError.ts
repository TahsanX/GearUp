import { ZodError, ZodIssue } from 'zod';

export const handleZodError = (err: ZodError) => {
  const errorDetails = err.issues.map((issue: ZodIssue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: 'Validation Error',
    errorDetails,
  };
};
