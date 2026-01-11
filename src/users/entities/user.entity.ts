import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role, Country } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });
registerEnumType(Country, { name: 'Country' });

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Country)
  country: Country;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
