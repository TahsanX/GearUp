import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { GearService } from './gear.service.js';

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const result = await GearService.getAllGear(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear items retrieved successfully',
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const result = await GearService.getGearById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Gear item retrieved successfully',
    data: result,
  });
});

export const GearController = {
  getAllGear,
  getGearById,
};
