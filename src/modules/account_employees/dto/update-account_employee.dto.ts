import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountEmployeeDto } from './create-account_employee.dto';

export class UpdateAccountEmployeeDto extends PartialType(CreateAccountEmployeeDto) {}
