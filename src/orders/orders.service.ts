import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { User, Role, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(user: User, createOrderInput: CreateOrderInput) {
    // Calculate total and verify items
    let total = 0;
    const orderItemsData: { menuItemId: string; quantity: number }[] = [];

    for (const item of createOrderInput.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { restaurant: true },
      });

      if (!menuItem) {
        throw new NotFoundException(`MenuItem ${item.menuItemId} not found`);
      }

      if (menuItem.restaurant.country !== user.country) {
        throw new ForbiddenException(
          `Cannot order from restaurant in different country`,
        );
      }

      total += menuItem.price * item.quantity;
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: OrderStatus.PENDING,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { menuItem: true } }, user: true },
    });
  }

  async findAll(user: User) {
    if (user.role === Role.MEMBER) {
      return this.prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { menuItem: true } }, user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin/Manager: view all orders in their country
      return this.prisma.order.findMany({
        where: {
          user: {
            country: user.country,
          },
        },
        include: { items: { include: { menuItem: true } }, user: true },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async checkout(id: string, user: User) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Only Admin/Manager can process payment/checkout per requirements
    // Wait, requirement: "Checkout & pay: Admin, Manager. Member NO".
    // So Member CANNOT call this.
    // Also "Restricts users to operate only within their assigned country"
    if (order.user.country !== user.country) {
      throw new ForbiddenException('Cannot manage order from another country');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PAID },
      include: { items: { include: { menuItem: true } }, user: true },
    });
  }

  async cancel(id: string, user: User) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.user.country !== user.country) {
      throw new ForbiddenException('Cannot manage order from another country');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: { items: { include: { menuItem: true } }, user: true },
    });
  }
}
