import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Public } from '../../decorator/customize';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Public()
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.employeesService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get('history')
  async findAllHistory(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.employeesService.findAllHistory(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Public()
  @Patch()
  update(@Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(updateEmployeeDto);
  }

  @Public()
  @Patch(':id/hide')
  hide(@Param('id') id: string) {
    return this.employeesService.updateIsHidden(id, false);
  }

  @Public()
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.employeesService.updateIsHidden(id, true);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Public()
  @Delete()
  removeMany(@Body('ids') ids: string[]) {
    return this.employeesService.removeMany(ids);
  }

  @Public()
  @Patch('hide-many')
  hideMany(@Body('ids') ids: string[]) {
    return this.employeesService.updateManyIsHidden(ids, false);
  }

  @Public()
  @Patch('restore-many')
  restoreMany(@Body('ids') ids: string[]) {
    return this.employeesService.updateManyIsHidden(ids, true);
  }

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    return this.employeesService.importFromExcel(file);
  }

  @Public()
  @Post('export')
  async exportStudents(@Res() res: Response) {
    const buffer = await this.employeesService.exportToExcel();

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
