import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@gearup.com';
  const adminPassword = 'Admin@12345';

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'GearUp Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: 'provider@gearup.com' },
    update: {},
    create: {
      name: 'Trailhead Rentals',
      email: 'provider@gearup.com',
      password: await bcrypt.hash('Provider@12345', 10),
      role: Role.PROVIDER,
    },
  });

  const categories = await Promise.all(
    ['Cycling', 'Camping', 'Fitness', 'Water Sports'].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  await prisma.gearItem.upsert({
    where: { id: 'seed-gear-mountain-bike' },
    update: {},
    create: {
      id: 'seed-gear-mountain-bike',
      name: 'Trek Mountain Bike',
      description: 'All-terrain mountain bike, great for trails and rough roads.',
      brand: 'Trek',
      pricePerDay: 15.0,
      stock: 5,
      images: [],
      isAvailable: true,
      providerId: provider.id,
      categoryId: categories[0].id,
    },
  });

  console.log('Seed completed');
  console.log('Admin credentials -> email:', adminEmail, '| password:', adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
