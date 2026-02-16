import { Module } from '@nestjs/common';
import { TrainingProgramsService } from './training_programs.service';
import { TrainingProgramsController } from './training_programs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrainingProgram,
  TrainingProgramSchema,
} from './entities/training_program.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingProgram.name, schema: TrainingProgramSchema },
    ]),
  ],
  controllers: [TrainingProgramsController],
  providers: [TrainingProgramsService],
})
export class TrainingProgramsModule {}
