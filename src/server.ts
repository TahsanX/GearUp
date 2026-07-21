import { Server } from 'http';
import app from './app.js';
import { config } from './config/index.js';
import prisma from './app/utils/prisma.js';

let server: Server;

async function main() {
  await prisma.$connect();

  server = app.listen(config.port, () => {
    console.log(`GearUp API is listening on port ${config.port}`);
  });
}

main();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection detected, shutting down...', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception detected, shutting down...', err);
  process.exit(1);
});
