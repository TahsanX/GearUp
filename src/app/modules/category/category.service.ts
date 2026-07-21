import prisma from '../../utils/prisma.js';

const createCategory = async (payload: { name: string }) => {
  return prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
};
