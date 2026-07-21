import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { AppError } from '../../../errors/AppError.js';
import { config } from '../../../config/index.js';
import prisma from '../../utils/prisma.js';
import { createToken } from '../../utils/jwt.js';

type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CUSTOMER' | 'PROVIDER';
};

const register = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existingUser) {
    throw new AppError(409, 'A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: (payload.role as Role) ?? Role.CUSTOMER,
    },
  });

  const token = createToken({ id: user.id, email: user.email, role: user.role });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError(403, 'Your account has been suspended');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = createToken({ id: user.id, email: user.email, role: user.role });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const AuthService = {
  register,
  login,
  getMe,
};
