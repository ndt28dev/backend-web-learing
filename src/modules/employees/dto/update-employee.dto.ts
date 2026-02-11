import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id!: string;

  @IsNotEmpty({ message: 'Code không được để trống' })
  code!: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  name!: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsPhoneNumber('VN', { message: 'Số điện thoại không đúng định dạng' })
  phone!: string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender!: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  birthday!: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address!: string;

  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  role!: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
