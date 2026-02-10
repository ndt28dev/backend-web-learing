import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AccountStudentsService } from './account_students.service';
import {
  ChangePasswordAccountStudentDto,
  CreateAccountStudentDto,
} from './dto/create-account_student.dto';
import { UpdateAccountStudentDto } from './dto/update-account_student.dto';
import { Public } from '../../decorator/customize';

@Controller('account-students')
export class AccountStudentsController {
  constructor(
    private readonly accountStudentsService: AccountStudentsService,
  ) {}

  @Post()
  create(@Body() createAccountStudentDto: CreateAccountStudentDto) {
    return this.accountStudentsService.create(createAccountStudentDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.accountStudentsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountStudentsService.findOne(+id);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountStudentsService.remove(id);
  }

  @Public()
  @Patch('change-password')
  async changePassword(@Body() data: ChangePasswordAccountStudentDto) {
    return this.accountStudentsService.changePassword(data);
  }
}
