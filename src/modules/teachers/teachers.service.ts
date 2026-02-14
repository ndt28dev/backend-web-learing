import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from './entities/teacher.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '../../helpers/util';
import { AccountTeachersService } from '../account_teachers/account_teachers.service';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {
  REQUIRED_COLUMNS,
  TEACHER_COLUMNS,
} from './constants/teacher-import.constant';
import { CertificatesTeacherService } from '../certificates_teacher/certificates_teacher.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teachersModel: Model<Teacher>,
    private readonly accountTeachersService: AccountTeachersService,
    private readonly certificatesTeacherService: CertificatesTeacherService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.teachersModel.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  isCodeExists = async (code: string) => {
    const user = await this.teachersModel.exists({ code });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createTeacherDto: any) {
    const isCodeExists = await this.isCodeExists(createTeacherDto.code);
    if (isCodeExists) {
      throw new BadRequestException('Mã học viên đã tồn tại');
    }

    const isExist = await this.isEmailExists(createTeacherDto.email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const teacher = await this.teachersModel.create({
      ...createTeacherDto,
    });

    const hashPassword = (await hashPasswordHelper('123456')) as string;

    await this.accountTeachersService.createForTeacher({
      teacher: teacher._id.toString(),
      username: teacher.code,
      password: hashPassword,
    });

    return {
      _id: teacher._id.toString(),
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = true;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.teachersModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.teachersModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();
    return { results, totalPages, total: totalItems };
  }

  async findAllHistory(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    filter.is_hidden = false;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const skip = (current - 1) * pageSize;

    const totalItems = await this.teachersModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const results = await this.teachersModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

    return {
      results,
      totalPages,
      total: totalItems,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} teacher`;
  }

  async update(updateTeacherDto: UpdateTeacherDto) {
    return await this.teachersModel.updateOne(
      { _id: updateTeacherDto._id },
      { ...updateTeacherDto },
    );
  }

  async updateIsHidden(id: string, isHidden: boolean) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const teacher = await this.teachersModel.findById(id);
    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    await this.accountTeachersService.updateIsHiddenByTeacher(
      teacher._id.toString(),
      isHidden,
    );

    await this.certificatesTeacherService.updateHiddenByTeacher(id, isHidden);

    return this.teachersModel.updateOne({ _id: id }, { is_hidden: isHidden });
  }

  async updateManyIsHidden(ids: string[], isHidden: boolean) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));

    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const teachers = await this.teachersModel.find({
      _id: { $in: validIds },
    });

    const teacherIds = teachers.map((t) => t._id.toString());

    await this.accountTeachersService.updateManyIsHiddenByTeachers(
      teacherIds,
      isHidden,
    );

    await this.certificatesTeacherService.updateHiddenByTeachers(
      teacherIds,
      isHidden,
    );

    return this.teachersModel.updateMany(
      { _id: { $in: validIds } },
      { $set: { is_hidden: isHidden } },
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const teacher = await this.teachersModel.findById(id);
    if (!teacher) {
      throw new NotFoundException('Không tìm thấy học viên');
    }

    await this.accountTeachersService.removeByTeacher(teacher._id.toString());

    await this.certificatesTeacherService.removeByTeacher(
      teacher._id.toString(),
    );

    return this.teachersModel.deleteOne({ _id: id });
  }

  async removeMany(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const teachers = await this.teachersModel.find({
      _id: { $in: validIds },
    });

    const teachersIds = teachers.map((a) => a._id.toString());

    await this.accountTeachersService.removeManyByTeachers(teachersIds);

    await this.certificatesTeacherService.removeByTeachers(teachersIds);

    return this.teachersModel.deleteMany({
      _id: { $in: ids },
    });
  }

  async importFromExcel(file: Express.Multer.File) {
    // 1️⃣ Đọc file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      throw new BadRequestException('File không có dữ liệu');
    }

    // CHECK HEADER (DÒNG ĐẦU)
    const fileColumns = Object.keys(rows[0]);

    // Cột không thuộc teacher
    const invalidColumns = fileColumns.filter(
      (col) => !TEACHER_COLUMNS.includes(col),
    );

    if (invalidColumns.length > 0) {
      throw new BadRequestException(
        `File có cột không thuộc Teacher: ${invalidColumns.join(', ')}`,
      );
    }

    // (Optional) Check thiếu cột bắt buộc
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !fileColumns.includes(col),
    );

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `File thiếu cột bắt buộc: ${missingColumns.join(', ')}`,
      );
    }

    // ===============================
    // 2️⃣ MAP DỮ LIỆU
    // ===============================
    const teachers = rows.map((row: any) => ({
      code: row.code,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      gender:
        row.gender === 'Nam'
          ? 'MALE'
          : row.gender === 'Nữ'
            ? 'FEMALE'
            : 'OTHER',
      birthday: row.birthday ? new Date(row.birthday) : null,
      is_hidden: true,
      avatar: row.avatar,
      degree:
        row.degree === 'Cao đẳng'
          ? 'COLLEGE'
          : row.degree === 'Cử nhân'
            ? 'BACHELOR'
            : row.degree === 'Kỹ sư'
              ? 'ENGINEER'
              : row.degree === 'Thạc sĩ'
                ? 'MASTER'
                : row.degree === 'Tiến sĩ'
                  ? 'PHD'
                  : null,
      specialization: row.specialization,
      university: row.university,
      experience: row.experience,
      achievements: row.achievements,
      description: row.description,
    }));

    // ===============================
    // 3️⃣ CHECK TRÙNG CODE TRONG FILE
    // ===============================
    const codes = teachers.map((s) => s.code);
    const duplicateCodesInFile = codes.filter(
      (code, index) => codes.indexOf(code) !== index,
    );

    if (duplicateCodesInFile.length > 0) {
      throw new BadRequestException(
        `File Excel bị trùng mã giáo viên: ${[
          ...new Set(duplicateCodesInFile),
        ].join(', ')}`,
      );
    }

    // ===============================
    // 4️⃣ CHECK TRÙNG CODE DB
    // ===============================
    const existedTeachers = await this.teachersModel.find(
      { code: { $in: codes } },
      { code: 1 },
    );

    if (existedTeachers.length > 0) {
      throw new BadRequestException(
        `Mã giáo viên đã tồn tại: ${existedTeachers
          .map((s) => s.code)
          .join(', ')}`,
      );
    }

    // ===============================
    // 5️⃣ INSERT DB
    // ===============================
    const TeachersAdd = await this.teachersModel.insertMany(teachers);

    const defaultPassword = (await hashPasswordHelper('123456')) as string;

    const accountTeachers = TeachersAdd.map((teacher) => ({
      teacher: teacher._id,
      username: teacher.code,
      password: defaultPassword,
      is_active: false,
    }));

    await this.accountTeachersService.insertMany(accountTeachers);

    return {
      total: Teacher.length,
      message: 'Import thành công',
    };
  }

  async exportToExcel(): Promise<Buffer> {
    const teachers = await this.teachersModel.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Teachers');

    // Header
    worksheet.columns = [
      { header: 'Mã HV', key: 'code', width: 15 },
      { header: 'Họ tên', key: 'name', width: 25 },
      { header: 'Giới tính', key: 'gender', width: 10 },
      { header: 'Ngày sinh', key: 'birthday', width: 10 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 30 },
      { header: 'Địa chỉ', key: 'address', width: 30 },
      { header: 'Bằng cấp', key: 'degree', width: 20 },
      { header: 'Chuyên ngành', key: 'specialization', width: 25 },
      { header: 'Trường / Đơn vị đào tạo', key: 'university', width: 35 },
      { header: 'Kinh nghiệm', key: 'experience', width: 40 },
      { header: 'Thành tích', key: 'achievements', width: 40 },
      { header: 'Mô tả', key: 'description', width: 40 },
    ];

    // Data
    teachers.forEach((s) => {
      worksheet.addRow({
        code: s.code,
        name: s.name,
        gender:
          s.gender === 'MALE' ? 'Nam' : s.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        birthday: s.birthday,
        email: s.email,
        phone: s.phone,
        address: s.address,
        degree:
          s.degree === 'COLLEGE'
            ? 'Cao đẳng'
            : s.degree === 'BACHELOR'
              ? 'Cử nhân'
              : s.degree === 'ENGINEER'
                ? 'Kỹ sư'
                : s.degree === 'MASTER'
                  ? 'Thạc sĩ'
                  : s.degree === 'PHD'
                    ? 'Tiến sĩ'
                    : null,
        specialization: s.specialization,
        university: s.university,
        experience: s.experience,
        achievements: s.achievements,
        description: s.description,
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
