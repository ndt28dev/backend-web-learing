import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Teacher } from '../../teachers/entities/teacher.schema';

export type AccountTeacherDocument = AccountTeacher & Document;

@Schema({ timestamps: true })
export class AccountTeacher {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Teacher.name })
  teacher!: mongoose.Schema.Types.ObjectId;

  @Prop()
  username!: string;

  @Prop()
  password!: string;

  @Prop({ default: false })
  is_active!: boolean;

  @Prop()
  code_id!: string;

  @Prop()
  code_expired!: string;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const AccountTeacherSchema =
  SchemaFactory.createForClass(AccountTeacher);
