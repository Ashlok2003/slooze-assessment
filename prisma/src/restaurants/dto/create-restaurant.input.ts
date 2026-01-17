import { InputType, Field } from '@nestjs/graphql';
import { Country } from '@prisma/client';
import { IsNotEmpty, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMenuItemInput } from './create-menu-item.input';

@InputType()
export class CreateRestaurantInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;

  @Field(() => [CreateMenuItemInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemInput)
  menuItems?: CreateMenuItemInput[];
}
