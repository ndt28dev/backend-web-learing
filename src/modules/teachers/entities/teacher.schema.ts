import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({ timestamps: true })
export class Teacher {
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

  @Prop()
  degree!: string;

  @Prop()
  specialization!: string;

  @Prop()
  university!: string;

  @Prop()
  experience!: string;

  @Prop()
  achievements!: string;

  @Prop()
  description!: string;

  @Prop({ default: 'TEACHER' })
  role!: string;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
