import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './entities/employee.schema';
import mongoose, { Model } from 'mongoose';
import { AccountEmployee } from '../account_employees/entities/account_employee.schema';
import { AccountEmployeesService } from '../account_employees/account_employees.service';
import { hashPasswordHelper } from '../../helpers/util';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {
  REQUIRED_COLUMNS,
  EMPLOYEE_COLUMNS,
} from './constants/employee-import.constant';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeesModel: Model<Employee>,
    private readonly accountEmployeesService: AccountEmployeesService,
    private readonly rolesService: RolesService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.employeesModel.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  isCodeExists = async (code: string) => {
    const user = await this.employeesModel.exists({ code });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createEmployeeDto: any) {
    const isCodeExists = await this.isCodeExists(createEmployeeDto.code);
    if (isCodeExists) {
      throw new BadRequestException('Mã nhân viên đã tồn tại');
    }

    const isExist = await this.isEmailExists(createEmployeeDto.email);
    if (isExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const student = await this.employeesModel.create({
      ...createEmployeeDto,
    });

    const hashPassword = (await hashPasswordHelper('123456')) as string;

    await this.accountEmployeesService.createForStudent({
      employee: student._id.toString(),
      username: student.code,
      password: hashPassword,
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

    const totalItems = (await this.employeesModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.employeesModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate('role', 'name code')
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

    const totalItems = await this.employeesModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);

    const results = await this.employeesModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate('role', 'name code')
      .exec();

    return {
      results,
      totalPages,
      total: totalItems,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  async update(updateEmployeeDto: UpdateEmployeeDto) {
    return await this.employeesModel.updateOne(
      { _id: updateEmployeeDto._id },
      { ...updateEmployeeDto },
    );
  }

  async updateIsHidden(id: string, isHidden: boolean) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const student = await this.employeesModel.findById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.accountEmployeesService.updateIsHiddenByEmployee(
      student._id.toString(),
      isHidden,
    );

    return this.employeesModel.updateOne({ _id: id }, { is_hidden: isHidden });
  }

  async updateManyIsHidden(ids: string[], isHidden: boolean) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));

    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const employees = await this.employeesModel.find({
      _id: { $in: validIds },
    });

    const employeeIds = employees.map((t) => t._id.toString());

    await this.accountEmployeesService.updateManyIsHiddenByEmployees(
      employeeIds,
      isHidden,
    );

    return this.employeesModel.updateMany(
      { _id: { $in: validIds } },
      { $set: { is_hidden: isHidden } },
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const student = await this.employeesModel.findById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.accountEmployeesService.removeByEmployee(student._id.toString());

    return this.employeesModel.deleteOne({ _id: id });
  }

  async removeMany(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách ID không hợp lệ');
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const employees = await this.employeesModel.find({
      _id: { $in: validIds },
    });

    const employeeIds = employees.map((a) => a._id.toString());

    await this.accountEmployeesService.removeManyByEmployees(employeeIds);

    return this.employeesModel.deleteMany({
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
      (col) => !EMPLOYEE_COLUMNS.includes(col),
    );

    if (invalidColumns.length > 0) {
      throw new BadRequestException(
        `File có cột không thuộc Employee: ${invalidColumns.join(', ')}`,
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
    const employees = await Promise.all(
      rows.map(async (row: any) => {
        const roleId = await this.rolesService.getRoleIdIfExists(row.role);

        return {
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
          role: roleId || null,
        };
      }),
    );

    // ===============================
    // 3️⃣ CHECK TRÙNG CODE TRONG FILE
    // ===============================
    const codes = employees.map((s) => s.code);
    const duplicateCodesInFile = codes.filter(
      (code, index) => codes.indexOf(code) !== index,
    );

    if (duplicateCodesInFile.length > 0) {
      throw new BadRequestException(
        `File Excel bị trùng mã nhân viên: ${[
          ...new Set(duplicateCodesInFile),
        ].join(', ')}`,
      );
    }

    // ===============================
    // 4️⃣ CHECK TRÙNG CODE DB
    // ===============================
    const existedStudents = await this.employeesModel.find(
      { code: { $in: codes } },
      { code: 1 },
    );

    if (existedStudents.length > 0) {
      throw new BadRequestException(
        `Mã nhân viên đã tồn tại: ${existedStudents
          .map((s) => s.code)
          .join(', ')}`,
      );
    }

    // ===============================
    // 5️⃣ INSERT DB
    // ===============================
    const employeesAdd = await this.employeesModel.insertMany(employees);

    const defaultPassword = (await hashPasswordHelper('123456')) as string;

    const accountEmployees = employeesAdd.map((employee) => ({
      employee: employee._id,
      username: employee.code,
      password: defaultPassword,
      is_active: false,
    }));

    await this.accountEmployeesService.insertMany(accountEmployees);

    return {
      total: employees.length,
      message: 'Import thành công',
    };
  }

  async exportToExcel(): Promise<Buffer> {
    const employees = await this.employeesModel.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Header
    worksheet.columns = [
      { header: 'Mã HV', key: 'code', width: 15 },
      { header: 'Họ tên', key: 'name', width: 25 },
      { header: 'Vai trò', key: 'role', width: 20 },
      { header: 'Giới tính', key: 'gender', width: 10 },
      { header: 'Ngày sinh', key: 'birthday', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
    ];

    // Data
    for (const s of employees) {
      const roleName = await this.rolesService.getRoleNameById(String(s.role));

      worksheet.addRow({
        code: s.code,
        name: s.name,
        gender:
          s.gender === 'MALE' ? 'Nam' : s.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        birthday: s.birthday,
        email: s.email,
        phone: s.phone,
        address: s.address,
        role: roleName || '',
      });
    }

    // Style header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
