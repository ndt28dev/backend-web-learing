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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Public } from '../../decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/teachers',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTeacherDto: CreateTeacherDto,
  ) {
    const avatar = file ? `/uploads/teachers/${file.filename}` : null;

    return this.teachersService.create({
      ...createTeacherDto,
      avatar,
    });
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.teachersService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get('history')
  async findAllHistory(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.teachersService.findAllHistory(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Public()
  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/teachers',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    let avatar = updateTeacherDto.avatar;

    if (file) {
      avatar = `/uploads/teachers/${file.filename}`;
    }

    return this.teachersService.update({
      ...updateTeacherDto,
      avatar,
    });
  }

  @Public()
  @Patch(':id/hide')
  hide(@Param('id') id: string) {
    return this.teachersService.updateIsHidden(id, false);
  }

  @Public()
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.teachersService.updateIsHidden(id, true);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }

  @Public()
  @Delete()
  removeMany(@Body('ids') ids: string[]) {
    return this.teachersService.removeMany(ids);
  }

  @Public()
  @Patch('hide-many')
  hideMany(@Body('ids') ids: string[]) {
    return this.teachersService.updateManyIsHidden(ids, false);
  }

  @Public()
  @Patch('restore-many')
  restoreMany(@Body('ids') ids: string[]) {
    return this.teachersService.updateManyIsHidden(ids, true);
  }

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTeachers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    return this.teachersService.importFromExcel(file);
  }

  @Public()
  @Post('export')
  async exportTeachers(@Res() res: Response) {
    const buffer = await this.teachersService.exportToExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="teachers.xlsx"',
    );

    return res.send(buffer);
  }
}
