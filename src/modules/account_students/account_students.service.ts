import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangePasswordAccountStudentDto,
  CreateAccountStudentDto,
} from './dto/create-account_student.dto';
import { UpdateAccountStudentDto } from './dto/update-account_student.dto';
import {
  AccountStudent,
  AccountStudentDocument,
} from './entities/account_student.schema';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChangePasswordAuthDto } from '../../auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { comparePasswordHelper, hashPasswordHelper } from '../../helpers/util';

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
      password: createAccountStudentDto.password,
      is_active: false,
      // code_id: uuidv4(),
      // code_expired: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });
  }

  create(createAccountStudentDto: CreateAccountStudentDto) {
    return 'This action adds a new accountStudent';
  }

  async insertMany(accounts: any) {
    return this.accountStudentModel.insertMany(accounts);
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = true;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.accountStudentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.accountStudentModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .populate('student')
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} accountStudent`;
  }

  update(id: number, updateAccountStudentDto: UpdateAccountStudentDto) {
    return `This action updates a #${id} accountStudent`;
  }

  async updateIsHiddenByStudent(id: string, isHidden: boolean) {
    return this.accountStudentModel.updateMany(
      { student: id },
      { $set: { is_hidden: isHidden } },
    );
  }

  async updateManyIsHiddenByStudents(ids: string[], isHidden: boolean) {
    return this.accountStudentModel.updateMany(
      { student: { $in: ids } },
      { $set: { is_hidden: isHidden } },
    );
  }

  async remove(id: string) {
    return this.accountStudentModel.deleteOne({ _id: id });
  }

  async removeByStudent(id: string) {
    return this.accountStudentModel.deleteMany({ student: id });
  }

  async removeManyByStudents(ids: string[]) {
    return this.accountStudentModel.deleteMany({ teacher: { $in: ids } });
  }

  async changePassword(data: ChangePasswordAccountStudentDto) {
    if (!mongoose.isValidObjectId(data._id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const account = await this.accountStudentModel.findById(data._id);

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const isMatch = await comparePasswordHelper(
      data.oldPassword,
      account.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // (Optional) không cho trùng mật khẩu cũ
    if (data.oldPassword === data.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
    }

    const hashedPassword = await hashPasswordHelper(data.newPassword);

    const result = await this.accountStudentModel.updateOne(
      { _id: data._id },
      { $set: { password: hashedPassword } },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }
}
