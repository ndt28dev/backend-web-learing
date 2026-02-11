import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Employee } from '../../employees/entities/employee.schema';

export type AccountEmployeeDocument = AccountEmployee & Document;

@Schema({ timestamps: true })
export class AccountEmployee {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  employee!: mongoose.Schema.Types.ObjectId;

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

export const AccountEmployeeSchema =
  SchemaFactory.createForClass(AccountEmployee);
