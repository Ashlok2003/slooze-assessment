import { PrismaClient, Role, Country, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password', 10);

  console.log('Seeding Users...');
  const users = [
    { email: 'admin@test.com', name: 'Super Admin', role: Role.ADMIN, country: Country.INDIA },
    { email: 'manager.in@test.com', name: 'Mumbai Manager', role: Role.MANAGER, country: Country.INDIA },
    { email: 'manager.us@test.com', name: 'NYC Manager', role: Role.MANAGER, country: Country.AMERICA },
    { email: 'member.in@test.com', name: 'Rahul Sharma', role: Role.MEMBER, country: Country.INDIA },
    { email: 'member.us@test.com', name: 'John Doe', role: Role.MEMBER, country: Country.AMERICA },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password,
        name: u.name,
        role: u.role,
        country: u.country,
      },
    });
  }

  console.log('Seeding India Restaurants...');
  const indiaRestaurants = [
    {
      name: 'The Spicy Tandoor',
      country: Country.INDIA,
      menu: [
        { name: 'Butter Chicken', price: 14.50 },
        { name: 'Garlic Naan', price: 3.50 },
        { name: 'Paneer Tikka Masala', price: 12.00 },
        { name: 'Chicken Biryani', price: 15.00 },
        { name: 'Mango Lassi', price: 4.50 },
      ]
    },
    {
      name: 'Mumbai Street Bites',
      country: Country.INDIA,
      menu: [
        { name: 'Vada Pav', price: 2.50 },
        { name: 'Pav Bhaji', price: 6.00 },
        { name: 'Pani Puri', price: 4.00 },
        { name: 'Masala Chai', price: 1.50 },
      ]
    },
    {
      name: 'Royal Mughal Palace',
      country: Country.INDIA,
      menu: [
        { name: 'Mutton Rogan Josh', price: 18.00 },
        { name: 'Galouti Kebab', price: 16.50 },
        { name: 'Shahi Tukda', price: 7.00 },
      ]
    },
    {
      name: 'South Zest',
      country: Country.INDIA,
      menu: [
        { name: 'Masala Dosa', price: 8.00 },
        { name: 'Idli Sambar', price: 6.50 },
        { name: 'Filter Coffee', price: 3.00 },
      ]
    },
    {
      name: 'Pizza Metro',
      country: Country.INDIA,
      menu: [
        { name: 'Paneer Makhani Pizza', price: 12.00 },
        { name: 'Spicy Chicken Pizza', price: 13.50 },
        { name: 'Cheese Garlic Bread', price: 5.00 },
      ]
    }
  ];

  for (const r of indiaRestaurants) {
    await prisma.restaurant.create({
      data: {
        name: r.name,
        country: r.country,
        menuItems: { create: r.menu },
      },
    });
  }

  console.log('Seeding USA Restaurants...');
  const usaRestaurants = [
    {
      name: 'Brooklyn Burger Joint',
      country: Country.AMERICA,
      menu: [
        { name: 'Double Cheeseburger', price: 12.99 },
        { name: 'Bacon Deluxe', price: 14.50 },
        { name: 'Sweet Potato Fries', price: 5.50 },
        { name: 'Vanilla Milkshake', price: 6.00 },
      ]
    },
    {
      name: 'Tony\'s NY Pizza',
      country: Country.AMERICA,
      menu: [
        { name: 'Pepperoni Slice', price: 4.50 },
        { name: 'Cheese Pie (Large)', price: 22.00 },
        { name: 'Garlic Knots (6)', price: 5.00 },
      ]
    },
    {
      name: 'Green & Fresh',
      country: Country.AMERICA,
      menu: [
        { name: 'Caesar Salad', price: 11.00 },
        { name: 'Quinoa Bowl', price: 13.50 },
        { name: 'Green Detox Juice', price: 8.00 },
      ]
    },
    {
      name: 'Steakhouse Prime',
      country: Country.AMERICA,
      menu: [
        { name: 'Ribeye Steak (12oz)', price: 35.00 },
        { name: 'Mashed Potatoes', price: 7.00 },
        { name: 'Grilled Asparagus', price: 8.00 },
      ]
    },
    {
      name: 'Donut Heaven',
      country: Country.AMERICA,
      menu: [
        { name: 'Glazed Donut', price: 2.50 },
        { name: 'Chocolate Frosted', price: 3.00 },
        { name: 'Coffee (Large)', price: 4.00 },
      ]
    }
  ];

  for (const r of usaRestaurants) {
    await prisma.restaurant.create({
      data: {
        name: r.name,
        country: r.country,
        menuItems: { create: r.menu },
      },
    });
  }

  console.log('Seeding Orders...');
  const memberIn = await prisma.user.findUnique({ where: { email: 'member.in@test.com' } });
  const tandoor = await prisma.restaurant.findFirst({ where: { name: 'The Spicy Tandoor' }, include: { menuItems: true } });

  if (memberIn && tandoor && tandoor.menuItems.length > 0) {
    await prisma.order.create({
      data: {
        userId: memberIn.id,
        status: OrderStatus.PAID,
        total: 29.50,
        items: {
          create: [
            { menuItemId: tandoor.menuItems[0].id, quantity: 2 }, // 2x Butter Chicken
          ]
        }
      }
    });

    await prisma.order.create({
      data: {
        userId: memberIn.id,
        status: OrderStatus.PENDING,
        total: 15.00,
        items: {
          create: [
            { menuItemId: tandoor.menuItems[3].id, quantity: 1 }, // 1x Biryani
          ]
        }
      }
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
