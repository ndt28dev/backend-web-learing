import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Restaurant } from '../../restaurants/schemas/restaurant.schema';
import { User } from '../../users/schemas/user.schema';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
  restaurant: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  rating: number;

  @Prop()
  comment: string;

  @Prop()
  image: string;

  @Prop()
  created_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
