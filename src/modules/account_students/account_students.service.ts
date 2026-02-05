import { Injectable } from '@nestjs/common';
import { CreateAccountStudentDto } from './dto/create-account_student.dto';
import { UpdateAccountStudentDto } from './dto/update-account_student.dto';
import {
  AccountStudent,
  AccountStudentDocument,
} from './entities/account_student.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AccountStudentsService {
  constructor(
    @InjectModel(AccountStudent.name)
    private readonly accountStudentModel: Model<AccountStudentDocument>,
  ) {}

  async createForStudent(createAccountStudentDto: CreateAccountStudentDto) {
    return this.accountStudentModel.create({
      student: createAccountStudentDto.student,
      username: createAccountStudentDto.username,
      password: '123456',
      is_active: false,
      // code_id: uuidv4(),
      // code_expired: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });
  }

  create(createAccountStudentDto: CreateAccountStudentDto) {
    return 'This action adds a new accountStudent';
  }

  findAll() {
    return `This action returns all accountStudents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountStudent`;
  }

  update(id: number, updateAccountStudentDto: UpdateAccountStudentDto) {
    return `This action updates a #${id} accountStudent`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountStudent`;
  }
}
