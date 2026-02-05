import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  code: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  // MALE | FEMALE
  @Prop()
  gender: string;

  @Prop()
  birthday: string;

  @Prop()
  avatar: string;

  @Prop()
  role: string;

  @Prop({ default: true })
  is_hidden: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
