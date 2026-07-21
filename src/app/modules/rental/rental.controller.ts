import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { RentalService } from './rental.service.js';

const createRental = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.createRental(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rental order created successfully',
    data: result,
  });
});

const getUserRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getUserRentals(req.user!.id, req.user!.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental orders retrieved successfully',
    data: result,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getRentalById(req.user!.id, req.user!.role, req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental order retrieved successfully',
    data: result,
  });
});

export const RentalController = {
  createRental,
  getUserRentals,
  getRentalById,
};
