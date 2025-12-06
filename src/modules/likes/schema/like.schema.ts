import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Restaurant } from '../../restaurants/schemas/restaurant.schema';
import { User } from '../../users/schemas/user.schema';

export type LikeDocument = Like & Document;

@Schema()
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
