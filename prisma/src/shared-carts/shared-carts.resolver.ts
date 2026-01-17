import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SharedCartsService } from './shared-carts.service';
import { SharedCart } from './entities/shared-cart.entity';
import { CreateSharedCartInput, AddItemsToSharedCartInput } from './dto/create-shared-cart.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => SharedCart)
@UseGuards(GqlAuthGuard)
export class SharedCartsResolver {
  constructor(private readonly sharedCartsService: SharedCartsService) { }

  /**
   * Create a new shared cart visible to users in the specified country
   */
  @Mutation(() => SharedCart)
  createSharedCart(
    @CurrentUser() user: User,
    @Args('input') input: CreateSharedCartInput,
  ) {
    return this.sharedCartsService.create(user, input);
  }

  /**
   * Add items to an existing shared cart (any user in same country can add)
   */
  @Mutation(() => SharedCart)
  addItemsToSharedCart(
    @CurrentUser() user: User,
    @Args('input') input: AddItemsToSharedCartInput,
  ) {
    return this.sharedCartsService.addItemsToSharedCart(
      input.sharedCartId,
      input.items,
      user,
    );
  }

  /**
   * Get all shared carts visible to the current user (based on their country)
   */
  @Query(() => [SharedCart], { name: 'sharedCarts' })
  findSharedCarts(@CurrentUser() user: User) {
    return this.sharedCartsService.findByCountry(user);
  }

  /**
   * Get a specific shared cart by its share code
   */
  @Query(() => SharedCart, { name: 'sharedCart' })
  findSharedCart(@CurrentUser() user: User, @Args('code') code: string) {
    return this.sharedCartsService.findByCode(code, user);
  }

  /**
   * Get shared carts created by the current user
   */
  @Query(() => [SharedCart], { name: 'mySharedCarts' })
  findMySharedCarts(@CurrentUser() user: User) {
    return this.sharedCartsService.findMySharedCarts(user.id);
  }

  /**
   * Delete a shared cart (only creator can delete)
   */
  @Mutation(() => SharedCart)
  deleteSharedCart(@CurrentUser() user: User, @Args('id') id: string) {
    return this.sharedCartsService.delete(id, user.id);
  }
}

