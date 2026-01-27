import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import e from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  // @HttpCode(200)
  // @Public()
  // @Post('login')
  // @ResponseMessage('Login success')
  // @UseGuards(LocalAuthGuard)
  // handleLogin(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }

  // @Public()
  // @Post('register')
  // getRegister(@Body() registerDto: CreateAuthDto) {
  //   return this.authService.handleRegister(registerDto);
  // }

  // @Public()
  // @Post('check-code')
  // checkCode(@Body() codeAuthDto: CodeAuthDto) {
  //   return this.authService.handleCheckCode(codeAuthDto);
  // }

  // @Public()
  // @Post('retry-active')
  // retryActive(@Body('email') email: string) {
  //   return this.authService.handleRetryActive(email);
  // }

  // @Public()
  // @Post('retry-password')
  // retryPassword(@Body('email') email: string) {
  //   return this.authService.handleRetryPassword(email);
  // }

  // @Public()
  // @Post('change-password')
  // changePassword(@Body() data: ChangePasswordAuthDto) {
  //   return this.authService.handleChangePassword(data);
  // }

  // @Public()
  // @Get('mail')
  // testMail() {
  //   this.mailerService
  //     .sendMail({
  //       to: 'ndt28dev@gmail.com', // list of receivers
  //       subject: 'Testing Nest MailerModule ✔', // Subject line
  //       text: 'welcome', // plaintext body
  //       template: 'register', // `.hbs` extension is appended automatically
  //       context: {
  //         name: 'ndt28dev',
  //         activationCode: '123456',
  //       },
  //     })
  //     .then(() => {})
  //     .catch(() => {});
  //   return 'ok mail';
  // }
}
