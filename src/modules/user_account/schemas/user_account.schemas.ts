import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: mongoose.Schema.Types.ObjectId;

  @Prop()
  password: string;

  @Prop({ default: 'LOCAL' })
  account_type: string;

  @Prop({ default: false })
  is_active: boolean;

  @Prop()
  code_id: string;

  @Prop()
  code_expired: string;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
