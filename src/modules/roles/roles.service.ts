import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private rolesModel: Model<Role>) {}

  isCodeExists = async (code: string) => {
    const user = await this.rolesModel.exists({ code });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createRoleDto: CreateRoleDto) {
    const isCodeExists = await this.isCodeExists(createRoleDto.code);
    if (isCodeExists) {
      throw new BadRequestException('Mã vai trò đã tồn tại');
    }

    const role = await this.rolesModel.create({ ...createRoleDto });

    return {
      _id: role._id.toString(),
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.rolesModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.rolesModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async getRoleIdIfExists(code: string): Promise<string | null> {
    if (!code) return null;

    const role = await this.rolesModel.findOne({ code }).select('_id').lean();

    return role ? role._id.toString() : null;
  }

  async getRoleNameById(id: string): Promise<string | null> {
    if (!id) return null;

    const role = await this.rolesModel.findById(id).select('name').lean();

    return role ? role.name : null;
  }

  async update(updateRoleDto: UpdateRoleDto) {
    return await this.rolesModel.updateOne(
      { _id: updateRoleDto._id },
      { ...updateRoleDto },
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const result = await this.rolesModel.deleteOne({
      _id: id,
      is_system: false,
    });

    if (result.deletedCount === 0) {
      throw new ForbiddenException(
        'Không thể xoá vai trò quan trọng trong hệ thống',
      );
    }

    return this.rolesModel.deleteOne({ _id: id });
  }
}
