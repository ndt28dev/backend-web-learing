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
import {
  ChangePasswordAccountEmployeeDto,
  CreateAccountEmployeeDto,
} from './dto/create-account_employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account_employee.dto';
import { Public } from '../../decorator/customize';

@Controller('account-employees')
export class AccountEmployeesController {
  constructor(
    private readonly accountEmployeesService: AccountEmployeesService,
  ) {}

  @Post()
  create(@Body() createAccountEmployeeDto: CreateAccountEmployeeDto) {
    return this.accountEmployeesService.create(createAccountEmployeeDto);
  }

  @Public()
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

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountEmployeesService.remove(id);
  }

  @Public()
  @Patch('change-password')
  async changePassword(@Body() data: ChangePasswordAccountEmployeeDto) {
    return this.accountEmployeesService.changePassword(data);
  }
}
