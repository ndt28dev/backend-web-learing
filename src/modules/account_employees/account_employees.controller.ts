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
import { AccountEmployeesService } from './account_employees.service';
import { CreateAccountEmployeeDto } from './dto/create-account_employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account_employee.dto';

@Controller('account-employees')
export class AccountEmployeesController {
  constructor(
    private readonly accountEmployeesService: AccountEmployeesService,
  ) {}

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeesService.create(createAccountEmployeeDto);
  }

  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.accountEmployeesService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountEmployeesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountEmployeeDto: UpdateAccountEmployeeDto,
  ) {
    return this.accountEmployeesService.update(+id, updateAccountEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountEmployeesService.remove(id);
  }
}
