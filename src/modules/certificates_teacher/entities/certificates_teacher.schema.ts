import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Teacher } from '../../teachers/entities/teacher.schema';
import { VerificationStatus } from '../enum/verification-status.enum';

export type CertificatesTeacherDocument = CertificatesTeacher & Document;

@Schema({ timestamps: true })
export class CertificatesTeacher {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Teacher.name })
  teacher!: mongoose.Schema.Types.ObjectId;

  @Prop()
  name!: string;

  @Prop()
  organization!: string;

  @Prop()
  certificate_number!: string;

  @Prop()
  issue_date!: Date;

  @Prop({ default: null })
  expiry_date!: Date;

  @Prop()
  description!: string;

  @Prop()
  image_url!: string;

  @Prop({
    type: String,
    enum: VerificationStatus,
    default: VerificationStatus.REGISTERED,
  })
  verification_status!: VerificationStatus;

  @Prop()
  reason!: string;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const CertificatesTeacherSchema =
  SchemaFactory.createForClass(CertificatesTeacher);
