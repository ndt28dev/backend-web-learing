import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Menu } from '../../menus/schemas/menu.schema';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Menu.name })
  menu: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  base_price: string;

  @Prop()
  image: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
