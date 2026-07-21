import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID as string,
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD as string,
    isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  },
  backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
