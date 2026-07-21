import { AppError } from '../../../errors/AppError.js';
import prisma from '../../utils/prisma.js';

type TCreateReviewPayload = {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
};

const createReview = async (customerId: string, payload: TCreateReviewPayload) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: payload.rentalOrderId },
    include: { items: true },
  });

  if (!rentalOrder) {
    throw new AppError(404, 'Rental order not found');
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(403, 'You are not allowed to review this rental order');
  }

  if (rentalOrder.status !== 'RETURNED') {
    throw new AppError(400, 'You can only leave a review after the gear has been returned');
  }

  const gearInOrder = rentalOrder.items.some((item) => item.gearItemId === payload.gearItemId);

  if (!gearInOrder) {
    throw new AppError(400, 'This gear item was not part of the rental order');
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      customerId,
      gearItemId: payload.gearItemId,
      rentalOrderId: payload.rentalOrderId,
    },
  });

  if (existingReview) {
    throw new AppError(409, 'You have already reviewed this gear item for this rental order');
  }

  return prisma.review.create({
    data: {
      customerId,
      gearItemId: payload.gearItemId,
      rentalOrderId: payload.rentalOrderId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

export const ReviewService = {
  createReview,
};
