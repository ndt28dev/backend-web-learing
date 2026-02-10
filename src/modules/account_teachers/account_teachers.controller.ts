import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountTeachersService } from './account_teachers.service';
import { CreateAccountTeacherDto } from './dto/create-account_teacher.dto';
import { UpdateAccountTeacherDto } from './dto/update-account_teacher.dto';

@Controller('account-teachers')
export class AccountTeachersController {
  constructor(private readonly accountTeachersService: AccountTeachersService) {}

  @Post()
  create(@Body() createAccountTeacherDto: CreateAccountTeacherDto) {
    return this.accountTeachersService.create(createAccountTeacherDto);
  }

  @Get()
  findAll() {
    return this.accountTeachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountTeachersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountTeacherDto: UpdateAccountTeacherDto) {
    return this.accountTeachersService.update(+id, updateAccountTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountTeachersService.remove(+id);
  }
}
