import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TrainingProgramStatus } from '../enums/enums';

export type TrainingProgramDocument = TrainingProgram & Document;

@Schema({ timestamps: true })
export class TrainingProgram {
  @Prop({ required: true, unique: true, trim: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({
    type: String,
    enum: TrainingProgramStatus,
    default: TrainingProgramStatus.DRAFT,
  })
  status!: TrainingProgramStatus;

  @Prop({ required: true })
  start_date!: Date;

  @Prop({ required: true })
  end_date!: Date;

  @Prop({ default: true })
  is_hidden!: boolean;
}

export const TrainingProgramSchema =
  SchemaFactory.createForClass(TrainingProgram);
