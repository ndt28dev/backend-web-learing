import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // const user = await this.authService.validateUser(username, password);
    const user = null;
    // if (!user) {
    //   throw new UnauthorizedException('Username/Password không hợp lệ');
    // }
    // if (!user.is_active)
    //   throw new ForbiddenException('Tài khoản chưa được kích hoạt');
    return user;
  }
}
