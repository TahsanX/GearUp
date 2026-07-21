import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/index.js';

export type TJwtPayload = {
  id: string;
  email: string;
  role: string;
};

export const createToken = (payload: TJwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string): TJwtPayload => {
  return jwt.verify(token, config.jwt.secret) as TJwtPayload;
};
