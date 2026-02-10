import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountTeacherDto } from './create-account_teacher.dto';

export class UpdateAccountTeacherDto extends PartialType(CreateAccountTeacherDto) {}
