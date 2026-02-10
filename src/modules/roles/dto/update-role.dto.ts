import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsMongoId({ message: 'ID khong hop le' })
  @IsNotEmpty({ message: 'ID khong duoc de trong' })
  _id!: string;

  @IsNotEmpty({ message: 'Mã vai trò không được để trống' })
  code!: string;

  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  name!: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description!: string;

  @IsOptional()
  is_system?: boolean;
}
