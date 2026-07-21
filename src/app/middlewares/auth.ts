import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...allowedRoles: Role[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not authorized');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'Your account has been suspended');
    }

    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  });
