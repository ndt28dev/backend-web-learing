import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrainingProgramDto {
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
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
