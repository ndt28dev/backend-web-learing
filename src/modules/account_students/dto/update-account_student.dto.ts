import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountStudentDto } from './create-account_student.dto';

export class UpdateAccountStudentDto extends PartialType(CreateAccountStudentDto) {}
