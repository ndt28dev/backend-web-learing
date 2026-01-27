import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '../../helpers/util';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '../../auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { UserAccountService } from '../user_account/user_account.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
    private readonly userAccountService: UserAccountService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const isExist = await this.isEmailExists(createUserDto.email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const user = await this.userModel.create({
      ...createUserDto,
    });

    await this.userAccountService.createForUser(user._id, '123456');

    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .exec();
    return { results, totalPages };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // async findByEmail(email: string) {
  //   return await this.userModel.findOne({ email });
  // }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    // check id
    if (mongoose.isValidObjectId(_id)) {
      return await this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('ID khong hop le');
    }
  }

  // async handleRegister(registerDto: CreateAuthDto) {
  //   const isExist = await this.isEmailExists(registerDto.email);
  //   if (isExist) {
  //     throw new BadRequestException('Email đã tồn tại');
  //   }
  //   const hashPassword = await hashPasswordHelper(registerDto.password);
  //   const codeId = uuidv4();
  //   const user = await this.userModel.create({
  //     ...registerDto,
  //     password: hashPassword,
  //     is_active: false,
  //     code_id: codeId,
  //     code_expired: dayjs().add(5, 'minutes'),
  //     // code_expired: dayjs().add(30, 'seconds'),
  //   });
  //   //send email
  //   this.mailerService.sendMail({
  //     to: user.email, // list of receivers
  //     subject: 'Activate your account at @ndt28dev', // Subject line
  //     template: 'register', // `.hbs` extension is appended automatically
  //     context: {
  //       name: user?.name ?? user?.email,
  //       activationCode: codeId,
  //     },
  //   });

  //   // trả ra phản hồi
  //   return {
  //     _id: user._id,
  //   };
  // }

  // async handleCheckCode(codeAuthDto: CodeAuthDto) {
  //   const user = await this.userModel.findOne({
  //     _id: codeAuthDto._id,
  //     code_id: codeAuthDto.code,
  //   });
  //   if (!user) {
  //     throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
  //   }

  //   // check code expired
  //   const isBeforeCheck = dayjs().isBefore(user.code_expired);
  //   if (isBeforeCheck) {
  //     await this.userModel.updateOne(
  //       { _id: codeAuthDto._id },
  //       { is_active: true },
  //     );
  //     return { isBeforeCheck };
  //   } else {
  //     throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
  //   }
  // }

  // async handleRetryActive(email: string) {
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }
  //   if (user.is_active) {
  //     throw new BadRequestException('Tài khoản đã được kích hoạt');
  //   }

  //   //send email
  //   const codeId = uuidv4();

  //   // update user
  //   await this.userModel.updateOne(
  //     { _id: user._id },
  //     { code_id: codeId, code_expired: dayjs().add(5, 'minutes') },
  //   );

  //   //send email
  //   this.mailerService.sendMail({
  //     to: user.email, // list of receivers
  //     subject: 'Activate your account at @ndt28dev', // Subject line
  //     template: 'register', // `.hbs` extension is appended automatically
  //     context: {
  //       name: user?.name ?? user?.email,
  //       activationCode: codeId,
  //     },
  //   });

  //   return { _id: user._id };
  // }

  // async handleRetryPassword(email: string) {
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }

  //   //send email
  //   const codeId = uuidv4();

  //   // update user
  //   await this.userModel.updateOne(
  //     { _id: user._id },
  //     { code_id: codeId, code_expired: dayjs().add(5, 'minutes') },
  //   );

  //   //send email
  //   this.mailerService.sendMail({
  //     to: user.email,
  //     subject: 'Change your password account at @ndt28dev',
  //     template: 'register',
  //     context: {
  //       name: user?.name ?? user?.email,
  //       activationCode: codeId,
  //     },
  //   });

  //   return { _id: user._id, email: user.email };
  // }

  // async handleChangePassword(data: ChangePasswordAuthDto) {
  //   if (data.confirmPassword !== data.newPassword) {
  //     throw new BadRequestException('Mật khẩu không hợp lệ');
  //   }

  //   const user = await this.userModel.findOne({
  //     email: data.email,
  //   });
  //   if (!user) {
  //     throw new BadRequestException('Tài khoản không tồn tại');
  //   }

  //   // check code expired
  //   const isBeforeCheck = dayjs().isBefore(user.code_expired);
  //   if (isBeforeCheck) {
  //     const newPassword = await hashPasswordHelper(data.newPassword);
  //     await this.userModel.updateOne(
  //       { email: data.email },
  //       { password: newPassword },
  //     );
  //     return { isBeforeCheck };
  //   } else {
  //     throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
  //   }
  // }
}
