import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Student } from '../../students/entities/student.schema';

export type AccountStudentDocument = AccountStudent & Document;

@Schema({ timestamps: true })
export class AccountStudent {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Student.name })
  student!: mongoose.Schema.Types.ObjectId;

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
}

export const AccountStudentSchema =
  SchemaFactory.createForClass(AccountStudent);
