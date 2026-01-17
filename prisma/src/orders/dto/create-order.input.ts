import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @Field()
  @IsUUID()
  menuItemId: string;

  @Field(() => Int)
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}
