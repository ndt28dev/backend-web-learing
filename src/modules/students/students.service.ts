import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from './entities/student.schema';
import mongoose, { Model } from 'mongoose';
import { AccountStudentsService } from '../account_students/account_students.service';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {
  REQUIRED_COLUMNS,
  STUDENT_COLUMNS,
} from './constants/student-import.constant';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentsModel: Model<Student>,
    private readonly accountStudentsService: AccountStudentsService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.studentsModel.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  isCodeExists = async (code: string) => {
    const user = await this.studentsModel.exists({ code });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createStudentDto: CreateStudentDto) {
    const isCodeExists = await this.isCodeExists(createStudentDto.code);
    if (isCodeExists) {
      throw new BadRequestException('Mã học viên đã tồn tại');
    }

    const isExist = await this.isEmailExists(createStudentDto.email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const student = await this.studentsModel.create({
      ...createStudentDto,
    });

    await this.accountStudentsService.createForStudent({
      student: student._id.toString(),
      username: student.code,
      password: '123456',
    });

    return {
      _id: student._id.toString(),
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

    const totalItems = (await this.studentsModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.studentsModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .exec();
    return { results, totalPages, total: totalItems };
  }

  async findAllHistory(query: string, current: number, pageSize: number) {
    const aqp = (await import('api-query-params')).default;

    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // 👉 CHỈ lấy student chưa bị ẩn
    filter.is_hidden = false;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const skip = (current - 1) * pageSize;

    const totalItems = await this.studentsModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const results = await this.studentsModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password')
      .exec();

    return {
      results,
      totalPages,
      total: totalItems,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  async update(updateStudentDto: UpdateStudentDto) {
    return await this.studentsModel.updateOne(
      { _id: updateStudentDto._id },
      { ...updateStudentDto },
    );
  }

  async updateIsHidden(id: string, isHidden: boolean) {
    return this.studentsModel.updateOne({ _id: id }, { is_hidden: isHidden });
  }

  async updateManyIsHidden(ids: string[], isHidden: boolean) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));

    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const result = await this.studentsModel.updateMany(
      { _id: { $in: validIds } },
      { $set: { is_hidden: isHidden } },
    );

    return {
      message: isHidden
        ? `Đã ẩn ${result.modifiedCount} học viên`
        : `Đã khôi phục ${result.modifiedCount} học viên`,
      modifiedCount: result.modifiedCount,
    };
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    return this.studentsModel.deleteOne({ _id: id });
  }

  async removeMany(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const invalidIds = ids.filter((id) => !mongoose.isValidObjectId(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException('Có ID không hợp lệ');
    }

    return this.studentsModel.deleteMany({
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

    // Cột không thuộc Student
    const invalidColumns = fileColumns.filter(
      (col) => !STUDENT_COLUMNS.includes(col),
    );

    if (invalidColumns.length > 0) {
      throw new BadRequestException(
        `File có cột không thuộc Student: ${invalidColumns.join(', ')}`,
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
    const students = rows.map((row: any) => ({
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
      educationLevel:
        row.educationLevel === 'Tiểu học'
          ? 'PRIMARY'
          : row.educationLevel === 'Trung học cơ sở'
            ? 'SECONDARY'
            : row.educationLevel === 'Trung học phổ thông'
              ? 'HIGH_SCHOOL'
              : row.educationLevel === 'Đại học'
                ? 'UNIVERSITY'
                : null,
      educationClass: row.educationClass,
      educationSchool: row.educationSchool,
    }));

    // ===============================
    // 3️⃣ CHECK TRÙNG CODE TRONG FILE
    // ===============================
    const codes = students.map((s) => s.code);
    const duplicateCodesInFile = codes.filter(
      (code, index) => codes.indexOf(code) !== index,
    );

    if (duplicateCodesInFile.length > 0) {
      throw new BadRequestException(
        `File Excel bị trùng mã học viên: ${[
          ...new Set(duplicateCodesInFile),
        ].join(', ')}`,
      );
    }

    // ===============================
    // 4️⃣ CHECK TRÙNG CODE DB
    // ===============================
    const existedStudents = await this.studentsModel.find(
      { code: { $in: codes } },
      { code: 1 },
    );

    if (existedStudents.length > 0) {
      throw new BadRequestException(
        `Mã học viên đã tồn tại: ${existedStudents
          .map((s) => s.code)
          .join(', ')}`,
      );
    }

    // ===============================
    // 5️⃣ INSERT DB
    // ===============================
    await this.studentsModel.insertMany(students);

    return {
      total: students.length,
      message: 'Import thành công',
    };
  }

  async exportToExcel(): Promise<Buffer> {
    const students = await this.studentsModel.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Header
    worksheet.columns = [
      { header: 'Mã HV', key: 'code', width: 15 },
      { header: 'Họ tên', key: 'name', width: 25 },
      { header: 'Giới tính', key: 'gender', width: 10 },
      { header: 'Ngày sinh', key: 'birthday', width: 10 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 30 },
      { header: 'Trình độ', key: 'educationLevel', width: 20 },
      { header: 'Lớp học', key: 'educationClass', width: 20 },
      { header: 'Trường học', key: 'educationSchool', width: 20 },
    ];

    // Data
    students.forEach((s) => {
      worksheet.addRow({
        code: s.code,
        name: s.name,
        gender:
          s.gender === 'MALE' ? 'Nam' : s.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        birthday: s.birthday,
        email: s.email,
        phone: s.phone,
        educationLevel:
          s.educationLevel === 'PRIMARY'
            ? 'Tiểu học'
            : s.educationLevel === 'SECONDARY'
              ? 'Trung học cơ sở'
              : s.educationLevel === 'HIGH_SCHOOL'
                ? 'Trung học phổ thông'
                : s.educationLevel === 'UNIVERSITY'
                  ? 'Đại học'
                  : null,
        educationClass: s.educationClass,
        educationSchool: s.educationSchool,
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
