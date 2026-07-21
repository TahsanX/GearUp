import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { ProviderService } from './provider.service.js';

const addGear = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.addGear(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Gear added to inventory successfully',
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.updateGear(req.user!.id, req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear updated successfully',
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.deleteGear(req.user!.id, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear removed from inventory successfully',
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.getProviderOrders(req.user!.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider's orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.updateOrderStatus(
    req.user!.id,
    req.params.id,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental order status updated successfully',
    data: result,
  });
});

export const ProviderController = {
  addGear,
  updateGear,
  deleteGear,
  getProviderOrders,
  updateOrderStatus,
};
