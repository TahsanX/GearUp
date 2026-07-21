import { Prisma } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';
import prisma from '../../utils/prisma.js';

type TGearFilters = {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  searchTerm?: string;
};

const getAllGear = async (filters: TGearFilters) => {
  const { category, brand, minPrice, maxPrice, searchTerm } = filters;

  const andConditions: Prisma.GearItemWhereInput[] = [{ isAvailable: true }];

  if (category) {
    andConditions.push({ category: { name: { equals: category, mode: 'insensitive' } } });
  }

  if (brand) {
    andConditions.push({ brand: { equals: brand, mode: 'insensitive' } });
  }

  if (minPrice) {
    andConditions.push({ pricePerDay: { gte: Number(minPrice) } });
  }

  if (maxPrice) {
    andConditions.push({ pricePerDay: { lte: Number(maxPrice) } });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { brand: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  return prisma.gearItem.findMany({
    where: { AND: andConditions },
    include: { category: true, provider: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getGearById = async (id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true, phone: true } },
      reviews: { include: { customer: { select: { id: true, name: true } } } },
    },
  });

  if (!gear) {
    throw new AppError(404, 'Gear item not found');
  }

  return gear;
};

export const GearService = {
  getAllGear,
  getGearById,
};
