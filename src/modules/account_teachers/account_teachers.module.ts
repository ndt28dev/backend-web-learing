import { Module } from '@nestjs/common';
import { AccountTeachersService } from './account_teachers.service';
import { AccountTeachersController } from './account_teachers.controller';

@Module({
  controllers: [AccountTeachersController],
  providers: [AccountTeachersService],
})
export class AccountTeachersModule {}
