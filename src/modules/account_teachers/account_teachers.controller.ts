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
import { AccountTeachersService } from './account_teachers.service';
import {
  ChangePasswordAccountTeacherDto,
  CreateAccountTeacherDto,
} from './dto/create-account_teacher.dto';
import { UpdateAccountTeacherDto } from './dto/update-account_teacher.dto';
import { Public } from '../../decorator/customize';

@Controller('account-teachers')
export class AccountTeachersController {
  constructor(
    private readonly accountTeachersService: AccountTeachersService,
  ) {}

  @Post()
  create(@Body() createAccountTeacherDto: CreateAccountTeacherDto) {
    return this.accountTeachersService.create(createAccountTeacherDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.accountTeachersService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountTeachersService.findOne(+id);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountTeachersService.remove(id);
  }

  @Public()
  @Patch('change-password')
  async changePassword(@Body() data: ChangePasswordAccountTeacherDto) {
    return this.accountTeachersService.changePassword(data);
  }
}
