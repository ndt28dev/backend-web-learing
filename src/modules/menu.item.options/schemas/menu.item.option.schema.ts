import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MenuItem } from '../../menu.items/schemas/menu.item.schema';

export type MenuItemOptionDocument = MenuItemOption & Document;

@Schema({ timestamps: true })
export class MenuItemOption {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MenuItem.name })
  menuitem: mongoose.Schema.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  additional_price: number;

  @Prop()
  optional_description: string;
}

export const MenuItemOptionSchema =
  SchemaFactory.createForClass(MenuItemOption);
