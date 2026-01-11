import { InputType, Field } from '@nestjs/graphql';
import { Role, Country } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => Role, { defaultValue: Role.MEMBER })
  @IsEnum(Role)
  role: Role;

  @Field(() => Country, { defaultValue: Country.INDIA })
  @IsEnum(Country)
  country: Country;
}
