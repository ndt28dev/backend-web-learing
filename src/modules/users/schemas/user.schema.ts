import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop({ default: 'USERS' })
  account_type: string;

  @Prop({ default: 'LOCAL' })
  role: string;

  @Prop({ default: false })
  is_active: boolean;

  @Prop()
  code_id: string;

  @Prop()
  code_expired: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
