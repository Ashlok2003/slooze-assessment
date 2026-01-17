import { InputType, Field, Int } from '@nestjs/graphql';
import { Country } from '@prisma/client';

@InputType()
export class SharedCartItemInput {
  @Field()
  menuItemId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateSharedCartInput {
  @Field(() => Country)
  country: Country;

  @Field(() => [SharedCartItemInput])
  items: SharedCartItemInput[];
}
