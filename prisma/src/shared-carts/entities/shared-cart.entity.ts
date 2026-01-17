import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Country } from '@prisma/client';

@ObjectType()
export class SharedCartMenuItem {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  price: number;
}

@ObjectType()
export class SharedCartItem {
  @Field()
  id: string;

  @Field(() => SharedCartMenuItem)
  menuItem: SharedCartMenuItem;

  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class SharedCartCreator {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email: string;

  @Field(() => Country)
  country: Country;
}

@ObjectType()
export class SharedCart {
  @Field()
  id: string;

  @Field()
  shareCode: string;

  @Field(() => Country)
  country: Country;

  @Field(() => SharedCartCreator)
  createdBy: SharedCartCreator;

  @Field(() => [SharedCartItem])
  items: SharedCartItem[];

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  createdAt: Date;
}
