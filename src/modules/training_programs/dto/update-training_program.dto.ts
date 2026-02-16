import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingProgramDto } from './create-training_program.dto';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TrainingProgramStatus } from '../enums/enums';

export class UpdateTrainingProgramDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id!: string;

  @IsNotEmpty({ message: 'Mã CTĐT không được để trống' })
  code!: string;

  @IsNotEmpty({ message: 'Tên CTĐT không được để trống' })
  name!: string;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  start_date!: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  end_date!: string;

  @IsOptional()
  @IsString()
  status?: TrainingProgramStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
