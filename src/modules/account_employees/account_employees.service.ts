import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangePasswordAccountEmployeeDto,
  CreateAccountEmployeeDto,
} from './dto/create-account_employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account_employee.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  AccountEmployee,
  AccountEmployeeDocument,
} from './entities/account_employee.schema';
import mongoose, { Model } from 'mongoose';
import { comparePasswordHelper, hashPasswordHelper } from '../../helpers/util';

@Injectable()
export class AccountEmployeesService {
  constructor(
    @InjectModel(AccountEmployee.name)
    private readonly accountEmployeeModel: Model<AccountEmployeeDocument>,
  ) {}

  async createForStudent(createAccountStudentDto: CreateAccountEmployeeDto) {
    return this.accountEmployeeModel.create({
      employee: createAccountStudentDto.employee,
      username: createAccountStudentDto.username,
      password: createAccountStudentDto.password,
      is_active: false,
      // code_id: uuidv4(),
      // code_expired: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    });
  }

  create(createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return 'This action adds a new accountEmployee';
  }

  async insertMany(accounts: any) {
    return this.accountEmployeeModel.insertMany(accounts);
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = true;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.accountEmployeeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.accountEmployeeModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .populate('employee')
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} accountEmployee`;
  }

  async findOneByUsernameAndByEmployeeId(employeeId: string, username: string) {
    const account = await this.accountEmployeeModel.findOne({
      employee: employeeId,
      username,
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    return account;
  }

  update(id: number, updateAccountEmployeeDto: UpdateAccountEmployeeDto) {
    return `This action updates a #${id} accountEmployee`;
  }

  async updateIsHidden(id: string, isHidden: boolean) {
    return this.accountEmployeeModel.updateOne(
      { _id: id },
      { is_hidden: isHidden },
    );
  }

  async updateManyIsHidden(ids: string[], isHidden: boolean) {
    return this.accountEmployeeModel.updateMany(
      { _id: { $in: ids } },
      { $set: { is_hidden: isHidden } },
    );
  }

  async remove(id: string) {
    return this.accountEmployeeModel.deleteOne({ _id: id });
  }

  async removeMany(ids: string[]) {
    return this.accountEmployeeModel.deleteMany({ _id: { $in: ids } });
  }

  async changePassword(data: ChangePasswordAccountEmployeeDto) {
    if (!mongoose.isValidObjectId(data._id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const account = await this.accountEmployeeModel.findById(data._id);

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

    const result = await this.accountEmployeeModel.updateOne(
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
