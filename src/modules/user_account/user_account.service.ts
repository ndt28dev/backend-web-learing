import { Injectable } from '@nestjs/common';
import { CreateUserAccountDto } from './dto/create-user_account.dto';
import { UpdateUserAccountDto } from './dto/update-user_account.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserAccount,
  UserAccountDocument,
} from './schemas/user_account.schemas';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserAccountService {
  constructor(
    @InjectModel(UserAccount.name)
    private readonly userAccountModel: Model<UserAccountDocument>,
  ) {}

  async createForUser(userId: Types.ObjectId, password: string) {
    return this.userAccountModel.create({
      user: userId,
      password,
      account_type: 'LOCAL',
    });
  }

  create(createUserAccountDto: CreateUserAccountDto) {
    return 'This action adds a new userAccount';
  }

  findAll() {
    return `This action returns all userAccount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAccount`;
  }

  update(id: number, updateUserAccountDto: UpdateUserAccountDto) {
    return `This action updates a #${id} userAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAccount`;
  }
}
