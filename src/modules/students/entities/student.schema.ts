import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
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

  @Prop({
    enum: ['PRIMARY', 'SECONDARY', 'HIGH_SCHOOL', 'UNIVERSITY'],
  })
  educationLevel!: string;

  @Prop()
  educationClass!: string;

  @Prop()
  educationSchool!: string;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
