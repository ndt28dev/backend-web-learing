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
import { TrainingProgramsService } from './training_programs.service';
import { CreateTrainingProgramDto } from './dto/create-training_program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training_program.dto';
import { Public } from '../../decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(
    private readonly trainingProgramsService: TrainingProgramsService,
  ) {}

  @Public()
  @Post()
  create(@Body() createTrainingProgramDto: CreateTrainingProgramDto) {
    return this.trainingProgramsService.create(createTrainingProgramDto);
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.trainingProgramsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingProgramsService.findOne(+id);
  }

  @Public()
  @Patch()
  update(@Body() updateTrainingProgramDto: UpdateTrainingProgramDto) {
    return this.trainingProgramsService.update(updateTrainingProgramDto);
  }

  @Public()
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.trainingProgramsService.updateStatus(id, status);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingProgramsService.remove(id);
  }

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importTrainingPrograms(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File không tồn tại');
    }

    return this.trainingProgramsService.importFromExcel(file);
  }

  @Public()
  @Post('export')
  async exportTrainingPrograms(@Res() res: Response) {
    const buffer = await this.trainingProgramsService.exportToExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="training_program.xlsx"',
    );

    return res.send(buffer);
  }
}
