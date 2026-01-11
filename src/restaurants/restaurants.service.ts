import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { User } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantInput: CreateRestaurantInput) {
    const { menuItems, ...rest } = createRestaurantInput;
    return this.prisma.restaurant.create({
      data: {
        ...rest,
        menuItems: {
          create: menuItems,
        },
      },
      include: { menuItems: true },
    });
  }

  async findAll(user: User) {
    return this.prisma.restaurant.findMany({
      where: {
        country: user.country,
      },
      include: { menuItems: true },
    });
  }
}
