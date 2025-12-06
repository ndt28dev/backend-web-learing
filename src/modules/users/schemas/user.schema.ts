import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum AccountType {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  image?: string; // url hoặc path

  @Prop({ enum: AccountType, default: AccountType.LOCAL })
  account_type?: AccountType;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role?: UserRole;

  @Prop({ default: true })
  is_active?: boolean;

  @Prop()
  code_id?: string; // mã xác thực (ví dụ OTP, reset token id)

  @Prop()
  code_expired?: Date; // thời hạn hết hạn của code
}

export const UserSchema = SchemaFactory.createForClass(User);

// Không expose password khi toObject / toJSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
