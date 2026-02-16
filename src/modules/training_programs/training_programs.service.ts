import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { CreateTrainingProgramDto } from './dto/create-training_program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training_program.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TrainingProgram } from './entities/training_program.schema';
import mongoose, { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {
  REQUIRED_COLUMNS,
  TRAININGPROGRAMS_COLUMNS,
} from './constants/training-programs-import.constant';

@Injectable()
export class TrainingProgramsService {
  constructor(
    @InjectModel(TrainingProgram.name)
    private trainigProgramModel: Model<TrainingProgram>,
  ) {}

  isCodeExists = async (code: string) => {
    const user = await this.trainigProgramModel.exists({ code });
    if (user) {
      return true;
    }
    return false;
  };

  async isCheckEndDate(startDate: string, endDate: string): Promise<boolean> {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Kiểm tra date hợp lệ
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return end > start;
  }

  async create(createTrainingProgramDto: CreateTrainingProgramDto) {
    const isCodeExists = await this.isCodeExists(createTrainingProgramDto.code);
    if (isCodeExists) {
      throw new BadRequestException('Mã CTĐT đã tồn tại');
    }

    const isCheckEndDate = await this.isCheckEndDate(
      createTrainingProgramDto.start_date,
      createTrainingProgramDto.end_date,
    );

    if (!isCheckEndDate) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }

    const trainigProgram = await this.trainigProgramModel.create({
      ...createTrainingProgramDto,
    });

    return {
      _id: trainigProgram._id.toString(),
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

    const totalItems = (await this.trainigProgramModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const results = await this.trainigProgramModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();
    return { results, totalPages, total: totalItems };
  }

  findOne(id: number) {
    return `This action returns a #${id} trainingProgram`;
  }

  update(updateTrainingProgramDto: UpdateTrainingProgramDto) {
    return this.trainigProgramModel.updateOne(
      { _id: updateTrainingProgramDto._id },
      { $set: updateTrainingProgramDto },
    );
  }

  async updateStatus(id: string, status: string) {
    return await this.trainigProgramModel.updateOne(
      { _id: id },
      { $set: { status } },
    );
  }

  remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    return this.trainigProgramModel.deleteOne({ _id: id });
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
      (col) => !TRAININGPROGRAMS_COLUMNS.includes(col),
    );

    if (invalidColumns.length > 0) {
      throw new BadRequestException(
        `File có cột không thuộc Training Programs: ${invalidColumns.join(', ')}`,
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
      start_date: row.start_date ? new Date(row.start_date) : null,
      end_date: row.end_date ? new Date(row.end_date) : null,
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
        `File Excel bị trùng mã CTĐT: ${[...new Set(duplicateCodesInFile)].join(
          ', ',
        )}`,
      );
    }

    // ===============================
    // 4️⃣ CHECK TRÙNG CODE DB
    // ===============================
    const existedTrainingPrograms = await this.trainigProgramModel.find(
      { code: { $in: codes } },
      { code: 1 },
    );

    if (existedTrainingPrograms.length > 0) {
      throw new BadRequestException(
        `Mã CTĐT đã tồn tại: ${existedTrainingPrograms
          .map((s) => s.code)
          .join(', ')}`,
      );
    }

    // ===============================
    // 5️⃣ INSERT DB
    // ===============================
    const trainingPrograms =
      await this.trainigProgramModel.insertMany(teachers);

    return {
      total: trainingPrograms.length,
      message: 'Import thành công',
    };
  }

  async exportToExcel(): Promise<Buffer> {
    const trainigPrograms = await this.trainigProgramModel.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Training Programs');

    // Header
    worksheet.columns = [
      { header: 'Mã CTĐT', key: 'code', width: 15 },
      { header: 'Tên CTĐT', key: 'name', width: 25 },
      { header: 'Ngày bắt đầu', key: 'start_date', width: 15 },
      { header: 'Ngày kết thúc', key: 'end_date', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Mô tả', key: 'description', width: 40 },
    ];

    // Data
    trainigPrograms.forEach((s) => {
      worksheet.addRow({
        code: s.code,
        name: s.name,
        start_date: s.start_date,
        end_date: s.end_date,
        status:
          s.status === 'DRAFT'
            ? 'Nháp'
            : s.status === 'UPCOMING'
              ? 'Sắp diễn ra'
              : s.status === 'ONGOING'
                ? 'Đang diễn ra'
                : s.status === 'COMPLETED'
                  ? 'Đã kết thúc'
                  : s.status === 'CANCELLED'
                    ? 'Đã huỷ'
                    : null,
        description: s.description,
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
