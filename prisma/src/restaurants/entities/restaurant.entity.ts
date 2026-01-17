import { ObjectType, Field } from '@nestjs/graphql';
import { Country } from '@prisma/client';
import { MenuItem } from './menu-item.entity';

@ObjectType()
export class Restaurant {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Country)
  country: Country;

  @Field(() => [MenuItem], { nullable: true })
  menuItems?: MenuItem[];
}
