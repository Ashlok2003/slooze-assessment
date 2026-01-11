import { PrismaClient, Role, Country } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      name: 'Admin User',
      role: Role.ADMIN,
      country: Country.INDIA,
    },
  });

  const managerIndia = await prisma.user.upsert({
    where: { email: 'manager.in@test.com' },
    update: {},
    create: {
      email: 'manager.in@test.com',
      password,
      name: 'Manager India',
      role: Role.MANAGER,
      country: Country.INDIA,
    },
  });

  const memberIndia = await prisma.user.upsert({
    where: { email: 'member.in@test.com' },
    update: {},
    create: {
      email: 'member.in@test.com',
      password,
      name: 'Member India',
      role: Role.MEMBER,
      country: Country.INDIA,
    },
  });

  const memberUS = await prisma.user.upsert({
    where: { email: 'member.us@test.com' },
    update: {},
    create: {
      email: 'member.us@test.com',
      password,
      name: 'Member US',
      role: Role.MEMBER,
      country: Country.AMERICA,
    },
  });

  // Restaurants
  const restIndia = await prisma.restaurant.create({
    data: {
      name: 'Spicy Curry House',
      country: Country.INDIA,
      menuItems: {
        create: [
          { name: 'Butter Chicken', price: 12.5 },
          { name: 'Naan', price: 2.0 },
        ],
      },
    },
  });

  const restUS = await prisma.restaurant.create({
    data: {
      name: 'Burger King US',
      country: Country.AMERICA,
      menuItems: {
        create: [
          { name: 'Whopper', price: 8.99 },
          { name: 'Fries', price: 3.5 },
        ],
      },
    },
  });

  console.log({ admin, managerIndia, memberIndia, memberUS, restIndia, restUS });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
