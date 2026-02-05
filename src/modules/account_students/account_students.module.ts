import { Module } from '@nestjs/common';
import { AccountStudentsService } from './account_students.service';
import { AccountStudentsController } from './account_students.controller';
import {
  AccountStudent,
  AccountStudentSchema,
} from './entities/account_student.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountStudent.name, schema: AccountStudentSchema },
    ]),
  ],
  controllers: [AccountStudentsController],
  providers: [AccountStudentsService],
  exports: [AccountStudentsService],
})
export class AccountStudentsModule {}
