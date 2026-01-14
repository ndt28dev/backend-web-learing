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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '../decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('register')
  getRegister(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Public()
  @Get('mail')
  testMail() {
    this.mailerService
      .sendMail({
        to: 'ndt28dev@gmail.com', // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register', // `.hbs` extension is appended automatically
        context: {
          name: 'ndt28dev',
          activationCode: '123456',
        },
      })
      .then(() => {})
      .catch(() => {});
    return 'ok mail';
  }
}
