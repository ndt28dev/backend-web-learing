import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Role } from '../../roles/entities/role.schema';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, lowercase: true })
  email!: string;

  @Prop({ trim: true })
  phone!: string;

  @Prop()
  address!: string;

  @Prop({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender!: string;

  @Prop({ type: Date })
  birthday!: Date;

  @Prop()
  avatar!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role!: mongoose.Schema.Types.ObjectId;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
