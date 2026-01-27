import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Password khong duoc de trong' })
  password: string;

  @IsOptional()
  name: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: '_id khong duoc de trong' })
  _id: string;

  @IsNotEmpty({ message: 'code khong duoc de trong' })
  code: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'Code khong duoc de trong' })
  code: string;

  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsNotEmpty({ message: 'NewPassword khong duoc de trong' })
  newPassword: string;

  @IsNotEmpty({ message: 'ConfirmPassword khong duoc de trong' })
  confirmPassword: string;
}
