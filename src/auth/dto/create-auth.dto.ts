import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Password khong duoc de trong' })
  password: string;

  @IsOptional()
  name: string;
}
