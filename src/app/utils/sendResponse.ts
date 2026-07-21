import { Response } from 'express';

type TMeta = {
  page?: number;
  limit?: number;
  total?: number;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: TMeta;
  data?: T;
};

export const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  res.status(payload.statusCode).json({
    success: payload.success,
    message: payload.message,
    meta: payload.meta,
    data: payload.data,
  });
};
