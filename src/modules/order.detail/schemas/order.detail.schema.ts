import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Order } from '../../orders/schemas/order.schema';
import { Menu } from '../../menus/schemas/menu.schema';
import { MenuItem } from '../../menu.items/schemas/menu.item.schema';
import { MenuItemOption } from '../../menu.item.options/schemas/menu.item.option.schema';

export type OrderDetailDocument = OrderDetail & Document;

@Schema()
export class OrderDetail {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Order.name })
  order: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Menu.name })
  menu: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MenuItem.name })
  menuitem: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MenuItemOption.name })
  menuitemoption: mongoose.Schema.Types.ObjectId;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
