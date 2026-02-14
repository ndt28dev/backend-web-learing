import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CertificatesTeacherService } from './certificates_teacher.service';
import { CreateCertificatesTeacherDto } from './dto/create-certificates_teacher.dto';
import { UpdateCertificatesTeacherDto } from './dto/update-certificates_teacher.dto';
import { Public } from '../../decorator/customize';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('certificates-teacher')
export class CertificatesTeacherController {
  constructor(
    private readonly certificatesTeacherService: CertificatesTeacherService,
  ) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/certificates',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCertificatesTeacherDto: CreateCertificatesTeacherDto,
  ) {
    const image_url = file ? `/uploads/certificates/${file.filename}` : null;

    return this.certificatesTeacherService.create({
      ...createCertificatesTeacherDto,
      image_url,
    });
  }

  @Public()
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.certificatesTeacherService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificatesTeacherService.findOne(+id);
  }

  @Public()
  @Patch()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/certificates',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateCertificatesTeacherDto: UpdateCertificatesTeacherDto,
  ) {
    let image_url = updateCertificatesTeacherDto.image_url;

    if (file) {
      image_url = `/uploads/certificates/${file.filename}`;
    }

    return this.certificatesTeacherService.update({
      ...updateCertificatesTeacherDto,
      image_url,
    });
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificatesTeacherService.remove(id);
  }

  @Public()
  @Patch('verification/:id')
  updateVerification(@Param('id') id: string) {
    return this.certificatesTeacherService.updateVerificationStatus(id);
  }

  @Public()
  @Patch('accept/:id')
  accept(@Param('id') id: string) {
    return this.certificatesTeacherService.acceptCertificate(id);
  }

  @Public()
  @Patch('cancel/:id')
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.certificatesTeacherService.cancelCertificate(id, reason);
  }
}
