import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { OrderItem } from './order-item.entity';
import { OrderStatus, Country } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class Order {
  @Field(() => String)
  id: string;

  @Field(() => User)
  user: User;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field(() => Float)
  total: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
