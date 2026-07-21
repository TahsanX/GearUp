import { RentalStatus } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';
import prisma from '../../utils/prisma.js';

const addGear = async (providerId: string, payload: Record<string, unknown>) => {
  return prisma.gearItem.create({
    data: { ...payload, providerId } as any,
  });
};

const updateGear = async (
  providerId: string,
  gearId: string,
  payload: Record<string, unknown>,
) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  if (gear.providerId !== providerId) {
    throw new AppError(403, 'You are not allowed to update this gear item');
  }

  return prisma.gearItem.update({ where: { id: gearId }, data: payload as any });
};

const deleteGear = async (providerId: string, gearId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  if (gear.providerId !== providerId) {
    throw new AppError(403, 'You are not allowed to delete this gear item');
  }

  return prisma.gearItem.delete({ where: { id: gearId } });
};

const getProviderOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { gearItem: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateOrderStatus = async (providerId: string, orderId: string, status: RentalStatus) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: { items: { include: { gearItem: true } } },
  });

  if (!order) {
    throw new AppError(404, 'Rental order not found');
  }

  const ownsOrder = order.items.some((item) => item.gearItem.providerId === providerId);

  if (!ownsOrder) {
    throw new AppError(403, 'You are not allowed to update this order');
  }

  return prisma.rentalOrder.update({ where: { id: orderId }, data: { status } });
};

export const ProviderService = {
  addGear,
  updateGear,
  deleteGear,
  getProviderOrders,
  updateOrderStatus,
};
