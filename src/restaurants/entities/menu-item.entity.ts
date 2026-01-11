import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Float)
  price: number;
}
