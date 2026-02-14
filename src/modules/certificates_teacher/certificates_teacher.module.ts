import { Module } from '@nestjs/common';
import { CertificatesTeacherService } from './certificates_teacher.service';
import { CertificatesTeacherController } from './certificates_teacher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CertificatesTeacher,
  CertificatesTeacherSchema,
} from './entities/certificates_teacher.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CertificatesTeacher.name, schema: CertificatesTeacherSchema },
    ]),
  ],
  controllers: [CertificatesTeacherController],
  providers: [CertificatesTeacherService],
  exports: [CertificatesTeacherService],
})
export class CertificatesTeacherModule {}
