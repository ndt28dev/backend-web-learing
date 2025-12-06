import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Restaurant } from '../../restaurants/schemas/restaurant.schema';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  image: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
