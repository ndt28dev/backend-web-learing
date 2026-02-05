import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountStudentsService } from './account_students.service';
import { CreateAccountStudentDto } from './dto/create-account_student.dto';
import { UpdateAccountStudentDto } from './dto/update-account_student.dto';

@Controller('account-students')
export class AccountStudentsController {
  constructor(private readonly accountStudentsService: AccountStudentsService) {}

  @Post()
  create(@Body() createAccountStudentDto: CreateAccountStudentDto) {
    return this.accountStudentsService.create(createAccountStudentDto);
  }

  @Get()
  findAll() {
    return this.accountStudentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountStudentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountStudentDto: UpdateAccountStudentDto) {
    return this.accountStudentsService.update(+id, updateAccountStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountStudentsService.remove(+id);
  }
}
