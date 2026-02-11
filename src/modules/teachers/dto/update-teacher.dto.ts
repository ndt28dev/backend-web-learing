import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateTeacherDto {
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

  @IsNotEmpty({ message: 'Bằng cấp không được để trống' })
  degree!: string;

  @IsNotEmpty({ message: 'Chuyên môn không được để trống' })
  specialization!: string;

  @IsNotEmpty({ message: 'Trường đại học không được để trống' })
  university?: string;

  @IsNotEmpty({ message: 'Kinh nghiệm không được để trống' })
  experience?: string;

  @IsOptional()
  @IsString()
  achievements?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
