import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class PaymentMethod {
  @Field(() => String)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  details: string;

  @Field(() => User)
  user: User;
}
