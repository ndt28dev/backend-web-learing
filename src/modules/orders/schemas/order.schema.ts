import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { mongo } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Restaurant } from '../../restaurants/schemas/restaurant.schema';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop()
  total_price: number;

  @Prop()
  status: string;

  @Prop()
  order_time: Date;

  @Prop()
  delivery_time: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
