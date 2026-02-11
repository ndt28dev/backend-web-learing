import { Module } from '@nestjs/common';
import { AccountEmployeesService } from './account_employees.service';
import { AccountEmployeesController } from './account_employees.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountEmployee,
  AccountEmployeeSchema,
} from './entities/account_employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountEmployee.name, schema: AccountEmployeeSchema },
    ]),
  ],
  controllers: [AccountEmployeesController],
  providers: [AccountEmployeesService],
  exports: [AccountEmployeesService],
})
export class AccountEmployeesModule {}
