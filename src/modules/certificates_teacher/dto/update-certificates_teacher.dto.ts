import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VerificationStatus } from '../enum/verification-status.enum';

export class UpdateCertificatesTeacherDto {
  @IsMongoId({ message: 'ID không hợp lệ' })
  @IsNotEmpty({ message: 'ID không được để trống' })
  _id!: string;

  @IsNotEmpty({ message: 'teacherId không được để trống' })
  @IsMongoId()
  teacher!: string;

  @IsNotEmpty({ message: 'Tên chứng chỉ không được để trống' })
  name!: string;

  @IsNotEmpty({ message: 'Nơi cấp không được để trống' })
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

  @IsOptional()
  @IsString()
  image_url!: string;
}
