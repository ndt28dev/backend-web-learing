import { Module } from '@nestjs/common';
import { AccountTeachersService } from './account_teachers.service';
import { AccountTeachersController } from './account_teachers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountTeacher,
  AccountTeacherSchema,
} from './entities/account_teacher.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountTeacher.name, schema: AccountTeacherSchema },
    ]),
  ],
  controllers: [AccountTeachersController],
  providers: [AccountTeachersService],
  exports: [AccountTeachersService],
})
export class AccountTeachersModule {}
