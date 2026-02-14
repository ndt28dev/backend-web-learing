import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangePasswordAccountTeacherDto,
  CreateAccountTeacherDto,
} from './dto/create-account_teacher.dto';
import { UpdateAccountTeacherDto } from './dto/update-account_teacher.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  AccountTeacher,
  AccountTeacherDocument,
} from './entities/account_teacher.schema';
import mongoose, { Model } from 'mongoose';
import { comparePasswordHelper, hashPasswordHelper } from '../../helpers/util';

@Injectable()
export class AccountTeachersService {
  constructor(
    @InjectModel(AccountTeacher.name)
    private readonly accountTeacherModel: Model<AccountTeacherDocument>,
  ) {}

  async createForTeacher(createAccountTeacherDto: CreateAccountTeacherDto) {
    return this.accountTeacherModel.create({
      teacher: createAccountTeacherDto.teacher,
      username: createAccountTeacherDto.username,
      password: createAccountTeacherDto.password,
      is_active: false,
      // code_id: uuidv4(),
      // code_expired: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });
  }

  create(createAccountTeacherDto: CreateAccountTeacherDto) {
    return 'This action adds a new accountTeacher';
  }

  async insertMany(accounts: any) {
    return this.accountTeacherModel.insertMany(accounts);
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = true;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.accountTeacherModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.accountTeacherModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .populate('teacher')
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} accountTeacher`;
  }

  update(id: number, updateAccountTeacherDto: UpdateAccountTeacherDto) {
    return `This action updates a #${id} accountTeacher`;
  }

  async updateIsHiddenByTeacher(teacherId: string, isHidden: boolean) {
    return this.accountTeacherModel.updateMany(
      { teacher: teacherId },
      { $set: { is_hidden: isHidden } },
    );
  }

  async updateManyIsHiddenByTeachers(teacherIds: string[], isHidden: boolean) {
    return this.accountTeacherModel.updateMany(
      { teacher: { $in: teacherIds } },
      { $set: { is_hidden: isHidden } },
    );
  }

  async remove(id: string) {
    return this.accountTeacherModel.deleteOne({ _id: id });
  }

  async removeByTeacher(teacherId: string) {
    return this.accountTeacherModel.deleteMany({
      teacher: teacherId,
    });
  }

  async removeManyByTeachers(teacherIds: string[]) {
    return this.accountTeacherModel.deleteMany({
      teacher: { $in: teacherIds },
    });
  }

  async changePassword(data: ChangePasswordAccountTeacherDto) {
    if (!mongoose.isValidObjectId(data._id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const account = await this.accountTeacherModel.findById(data._id);

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

    const result = await this.accountTeacherModel.updateOne(
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
