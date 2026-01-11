import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';

@Resolver(() => Restaurant)
@UseGuards(GqlAuthGuard, RolesGuard)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation(() => Restaurant)
  @Roles(Role.ADMIN, Role.MANAGER)
  createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
  ) {
    return this.restaurantsService.create(createRestaurantInput);
  }

  @Query(() => [Restaurant], { name: 'restaurants' })
  findAll(@CurrentUser() user: User) {
    return this.restaurantsService.findAll(user);
  }
}
