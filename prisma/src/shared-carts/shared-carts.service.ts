import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSharedCartInput } from './dto/create-shared-cart.input';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class SharedCartsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Generate a unique share code
   */
  private generateShareCode(): string {
    return randomBytes(6).toString('hex'); // 12-character hex code
  }

  /**
   * Create a shared cart visible to users in the specified country
   */
  async create(user: User, input: CreateSharedCartInput) {
    const shareCode = this.generateShareCode();

    // Validate all menu items exist
    const menuItemIds = input.items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    return this.prisma.sharedCart.create({
      data: {
        shareCode,
        country: input.country,
        createdById: user.id,
        items: {
          create: input.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  /**
   * Find all shared carts for the user's country
   * This makes shared carts visible to all users in that country
   */
  async findByCountry(user: User) {
    return this.prisma.sharedCart.findMany({
      where: {
        country: user.country,
      },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a specific shared cart by code
   * Only accessible if user's country matches the cart's target country
   */
  async findByCode(code: string, user: User) {
    const sharedCart = await this.prisma.sharedCart.findUnique({
      where: { shareCode: code },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!sharedCart) {
      throw new NotFoundException('Shared cart not found');
    }

    if (sharedCart.country !== user.country) {
      throw new ForbiddenException(
        'This shared cart is not available in your country',
      );
    }

    return sharedCart;
  }

  /**
   * Delete a shared cart (only creator can delete)
   */
  async delete(id: string, userId: string) {
    const sharedCart = await this.prisma.sharedCart.findUnique({
      where: { id },
    });

    if (!sharedCart) {
      throw new NotFoundException('Shared cart not found');
    }

    if (sharedCart.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own shared carts');
    }

    return this.prisma.sharedCart.delete({
      where: { id },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  /**
   * Get shared carts created by the current user
   */
  async findMySharedCarts(userId: string) {
    return this.prisma.sharedCart.findMany({
      where: { createdById: userId },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add items to an existing shared cart
   * Any user in the same country can add items
   */
  async addItemsToSharedCart(
    sharedCartId: string,
    items: { menuItemId: string; quantity: number }[],
    user: User,
  ) {
    const sharedCart = await this.prisma.sharedCart.findUnique({
      where: { id: sharedCartId },
      include: { items: true },
    });

    if (!sharedCart) {
      throw new NotFoundException('Shared cart not found');
    }

    // Check if user is from the same country
    if (sharedCart.country !== user.country) {
      throw new ForbiddenException(
        'You can only add items to shared carts in your country',
      );
    }

    // Validate all menu items exist
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('One or more menu items not found');
    }

    // Add new items or update quantities for existing items
    for (const item of items) {
      const existingItem = sharedCart.items.find(
        (i) => i.menuItemId === item.menuItemId,
      );

      if (existingItem) {
        // Update quantity
        await this.prisma.sharedCartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        // Add new item
        await this.prisma.sharedCartItem.create({
          data: {
            sharedCartId: sharedCart.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Return updated cart
    return this.prisma.sharedCart.findUnique({
      where: { id: sharedCartId },
      include: {
        createdBy: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }
}
