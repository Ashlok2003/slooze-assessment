import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { MenuItem } from '../../restaurants/entities/menu-item.entity';

@ObjectType()
export class OrderItem {
  @Field(() => String)
  id: string;

  @Field(() => MenuItem)
  menuItem: MenuItem;

  @Field(() => Int)
  quantity: number;
}
