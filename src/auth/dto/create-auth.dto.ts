import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Username khong duoc de trong' })
  username: string;

  @IsNotEmpty({ message: 'Password khong duoc de trong' })
  password: string;
}
