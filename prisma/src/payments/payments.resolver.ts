import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodInput } from './dto/create-payment-method.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Resolver(() => PaymentMethod)
@UseGuards(GqlAuthGuard, RolesGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Mutation(() => PaymentMethod)
  @Roles(Role.ADMIN)
  createPaymentMethod(@Args('createPaymentMethodInput') createPaymentMethodInput: CreatePaymentMethodInput) {
    return this.paymentsService.create(createPaymentMethodInput);
  }

  @Query(() => [PaymentMethod], { name: 'paymentMethods' })
  @Roles(Role.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }
}
