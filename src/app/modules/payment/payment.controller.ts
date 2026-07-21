import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { config } from '../../../config/index.js';
import { PaymentService } from './payment.service.js';

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPayment(req.user!.id, req.body.rentalOrderId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const transactionId = (req.query.transactionId || req.body.tran_id) as string;
  const failedOrCancelled = req.query.status as 'failed' | 'cancelled' | undefined;
  const valId = (req.body.val_id || req.query.val_id) as string | undefined;

  const status = failedOrCancelled ?? (valId ? 'success' : 'failed');

  const result = await PaymentService.confirmPayment(transactionId, status, valId);

  if (req.method === 'GET' || req.body.tran_id) {
    const redirectUrl = `${config.frontendUrl}/payment-status?transactionId=${transactionId}&status=${result.status}`;
    return res.redirect(redirectUrl);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmation processed',
    data: result,
  });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getUserPayments(req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(req.user!.id, req.user!.role, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  confirmPayment,
  getUserPayments,
  getPaymentById,
};
