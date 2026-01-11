import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, Role } from '@prisma/client';

@Resolver(() => Order)
@UseGuards(GqlAuthGuard, RolesGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.create(user, createOrderInput);
  }

  @Query(() => [Order], { name: 'orders' })
  findAll(@CurrentUser() user: User) {
    return this.ordersService.findAll(user);
  }

  @Mutation(() => Order)
  @Roles(Role.ADMIN, Role.MANAGER)
  checkoutOrder(@Args('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.checkout(id, user);
  }

  @Mutation(() => Order)
  @Roles(Role.ADMIN, Role.MANAGER)
  cancelOrder(@Args('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.cancel(id, user);
  }
}
