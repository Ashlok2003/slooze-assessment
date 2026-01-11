import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateMenuItemInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;
}
