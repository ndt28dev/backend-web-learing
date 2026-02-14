import { Prop } from '@nestjs/mongoose';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCertificatesTeacherDto {
  @IsNotEmpty({ message: 'teacherId không được để trống' })
  @IsMongoId()
  teacher!: string;

  @IsNotEmpty({ message: 'Tên chứng chỉ không được để trống' })
  name!: string;

  @IsNotEmpty({ message: 'Tổ chức cấp không được để trống' })
  organization!: string;

  @IsNotEmpty({ message: 'Ngày cấp không được để trống' })
  issue_date!: Date;

  @IsOptional()
  @IsString()
  certificate_number!: string;

  @IsOptional()
  @IsString()
  expiry_date!: Date;

  @IsOptional()
  @IsString()
  description!: string;
}

export class CancelCertificateDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
