import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Public } from '../../decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Multer } from 'multer';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Public()
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.studentsService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get('history')
  async findAllHistory(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.studentsService.findAllHistory(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Public()
  @Patch()
  update(@Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(updateStudentDto);
  }

  @Public()
  @Patch(':id/hide')
  hide(@Param('id') id: string) {
    return this.studentsService.updateIsHidden(id, false);
  }

  @Public()
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.studentsService.updateIsHidden(id, true);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Public()
  @Delete()
  removeMany(@Body('ids') ids: string[]) {
    return this.studentsService.removeMany(ids);
  }

  @Public()
  @Patch('hide-many')
  hideMany(@Body('ids') ids: string[]) {
    return this.studentsService.updateManyIsHidden(ids, false);
  }

  @Public()
  @Patch('restore-many')
  restoreMany(@Body('ids') ids: string[]) {
    return this.studentsService.updateManyIsHidden(ids, true);
  }

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    return this.studentsService.importFromExcel(file);
  }

  @Public()
  @Post('export')
  async exportStudents(@Res() res: Response) {
    const buffer = await this.studentsService.exportToExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students.xlsx"',
    );

    return res.send(buffer);
  }
}
