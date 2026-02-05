import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAccountStudentDto {
  @IsNotEmpty({ message: 'studentId không được để trống' })
  @IsMongoId()
  student!: string;

  @IsNotEmpty({ message: 'Mã học viên không được để trống' })
  username!: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password!: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  code_id?: string;

  @IsOptional()
  @IsString()
  code_expired?: string;
}
