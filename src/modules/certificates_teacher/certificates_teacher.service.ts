import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificatesTeacherDto } from './dto/create-certificates_teacher.dto';
import { UpdateCertificatesTeacherDto } from './dto/update-certificates_teacher.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CertificatesTeacher } from './entities/certificates_teacher.schema';
import { Model } from 'mongoose';

@Injectable()
export class CertificatesTeacherService {
  constructor(
    @InjectModel(CertificatesTeacher.name)
    private certificatesTeacherModel: Model<CertificatesTeacher>,
  ) {}

  async create(data: any) {
    return this.certificatesTeacherModel.create(data);
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = true;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.certificatesTeacherModel.find(filter))
      .length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.certificatesTeacherModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate('teacher', 'name')
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} certificatesTeacher`;
  }

  async updateHiddenByTeacher(teacherId: string, is_hidden: boolean) {
    return await this.certificatesTeacherModel.updateMany(
      { teacher: teacherId },
      { is_hidden },
    );
  }

  async updateHiddenByTeachers(teacherIds: string[], is_hidden: boolean) {
    return await this.certificatesTeacherModel.updateMany(
      { teacher: { $in: teacherIds } },
      { $set: { is_hidden } },
    );
  }

  async update(updateCertificatesTeacherDto: UpdateCertificatesTeacherDto) {
    return await this.certificatesTeacherModel.updateOne(
      { _id: updateCertificatesTeacherDto._id },
      { ...updateCertificatesTeacherDto },
    );
  }

  async remove(id: string) {
    return await this.certificatesTeacherModel.deleteOne({ _id: id });
  }

  async removeByTeacher(teacherId: string) {
    return await this.certificatesTeacherModel.deleteMany({
      teacher: teacherId,
    });
  }

  async removeByTeachers(teacherIds: string[]) {
    return await this.certificatesTeacherModel.deleteMany({
      teacher: teacherIds,
    });
  }

  async updateVerificationStatus(id: string) {
    const certificate = await this.certificatesTeacherModel.findById(id);

    if (!certificate) {
      throw new NotFoundException('Chứng chỉ không tồn tại');
    }

    return this.certificatesTeacherModel.updateOne(
      { _id: id },
      { $set: { verification_status: 'PENDING' } },
    );
  }

  async acceptCertificate(id: string) {
    const certificate = await this.certificatesTeacherModel.findById(id);

    if (!certificate) {
      throw new NotFoundException('Chứng chỉ không tồn tại');
    }

    return this.certificatesTeacherModel.updateOne(
      { _id: id, verification_status: 'PENDING' },
      { $set: { verification_status: 'VERIFIED' } },
    );
  }

  async cancelCertificate(id: string, reason: string) {
    {
      const certificate = await this.certificatesTeacherModel.findById(id);

      if (!certificate) {
        throw new NotFoundException('Chứng chỉ không tồn tại');
      }

      return this.certificatesTeacherModel.updateOne(
        { _id: id, verification_status: 'PENDING' },
        {
          $set: {
            verification_status: 'CANCELLED',
            cancel_reason: reason,
          },
        },
      );
    }
  }
}
