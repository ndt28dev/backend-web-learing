import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  rating: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
