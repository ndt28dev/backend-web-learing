import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from './entities/teacher.schema';
import { AccountTeachersModule } from '../account_teachers/account_teachers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }]),
    AccountTeachersModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
