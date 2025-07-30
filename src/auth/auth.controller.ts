import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { Response } from 'express';
import { Request } from 'express';

type RequestWithCookies = Omit<Request, 'cookies'> & {
  cookies: Record<string, string>;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  @AllowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() user: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.login(user);

    res.cookie(this.config.cookie.name, refreshToken, {
      httpOnly: this.config.cookie.httpOnly,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
      path: this.config.cookie.path,
      maxAge: this.config.refreshTokenExpiresIn * 1000,
    });

    return { token };
  }

  @AllowAnonymous()
  @Post('signup')
  public async signup(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.signup(userDto);
    res.cookie(this.config.cookie.name, refreshToken, {
      httpOnly: this.config.cookie.httpOnly,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
      path: this.config.cookie.path,
      maxAge: this.config.refreshTokenExpiresIn * 1000,
    });

    return { token };
  }

  @AllowAnonymous()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[this.config.cookie.name];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const { token: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken({ refreshToken });

    res.cookie(this.config.cookie.name, newRefreshToken, {
      httpOnly: this.config.cookie.httpOnly,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
      path: this.config.cookie.path,
      maxAge: this.config.refreshTokenExpiresIn * 1000,
    });

    return { token: newAccessToken };
  }
}
