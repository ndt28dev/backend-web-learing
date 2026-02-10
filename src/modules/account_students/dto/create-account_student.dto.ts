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

export class ChangePasswordAccountStudentDto {
  @IsNotEmpty({ message: '_id không được bỏ trống' })
  _id!: string;

  @IsNotEmpty({ message: 'Tài khoản không được bỏ trống' })
  username!: string;

  @IsNotEmpty({ message: 'Mật khẩu cũ không được bỏ trống' })
  oldPassword!: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được bỏ trống' })
  newPassword!: string;

  @IsNotEmpty({ message: 'Mật khẩu xác nhận mật khẩu không được bỏ trống' })
  confirmPassword!: string;
}
