import { Injectable } from '@nestjs/common';
import { CreateAccountTeacherDto } from './dto/create-account_teacher.dto';
import { UpdateAccountTeacherDto } from './dto/update-account_teacher.dto';

@Injectable()
export class AccountTeachersService {
  create(createAccountTeacherDto: CreateAccountTeacherDto) {
    return 'This action adds a new accountTeacher';
  }

  findAll() {
    return `This action returns all accountTeachers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountTeacher`;
  }

  update(id: number, updateAccountTeacherDto: UpdateAccountTeacherDto) {
    return `This action updates a #${id} accountTeacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountTeacher`;
  }
}
