import { Role } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';
import prisma from '../../utils/prisma.js';

type TCreateRentalPayload = {
  startDate: string;
  endDate: string;
  items: { gearItemId: string; quantity: number }[];
};

const createRental = async (customerId: string, payload: TCreateRentalPayload) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throw new AppError(400, 'End date must be after start date');
  }

  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const gearIds = payload.items.map((item) => item.gearItemId);
  const gearItems = await prisma.gearItem.findMany({ where: { id: { in: gearIds } } });

  if (gearItems.length !== gearIds.length) {
    throw new AppError(404, 'One or more gear items were not found');
  }

  for (const item of payload.items) {
    const gear = gearItems.find((g) => g.id === item.gearItemId);
    if (!gear || !gear.isAvailable || gear.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for gear item: ${gear?.name ?? item.gearItemId}`);
    }
  }

  let totalAmount = 0;
  const orderItemsData = payload.items.map((item) => {
    const gear = gearItems.find((g) => g.id === item.gearItemId)!;
    const price = Number(gear.pricePerDay) * item.quantity * days;
    totalAmount += price;
    return {
      gearItemId: item.gearItemId,
      quantity: item.quantity,
      price,
    };
  });

  return prisma.rentalOrder.create({
    data: {
      customerId,
      startDate,
      endDate,
      totalAmount,
      items: { create: orderItemsData },
    },
    include: { items: { include: { gearItem: true } } },
  });
};

const getUserRentals = async (userId: string, role: Role) => {
  if (role === Role.ADMIN) {
    return prisma.rentalOrder.findMany({
      include: { items: { include: { gearItem: true } }, customer: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  return prisma.rentalOrder.findMany({
    where: { customerId: userId },
    include: { items: { include: { gearItem: true } }, payments: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getRentalById = async (userId: string, role: Role, rentalId: string) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: {
      items: { include: { gearItem: true } },
      payments: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!rental) {
    throw new AppError(404, 'Rental order not found');
  }

  if (role === Role.CUSTOMER && rental.customerId !== userId) {
    throw new AppError(403, 'You are not allowed to view this rental order');
  }

  return rental;
};

export const RentalService = {
  createRental,
  getUserRentals,
  getRentalById,
};
