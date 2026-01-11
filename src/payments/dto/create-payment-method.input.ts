import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsNotEmpty()
  type: string;

  @Field()
  @IsNotEmpty()
  details: string;
}
