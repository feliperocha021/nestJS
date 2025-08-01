import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenPayloadDto } from './dto/refresh-token-payload.dto';

@Controller('auth')
@UseGuards(JwtAuthGuard)
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
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.login(dto);
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
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.signup(dto);
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
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(
    @Req() req: Request & { user: RefreshTokenPayloadDto },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(req.user);

    res.cookie(this.config.cookie.name, newRefreshToken, {
      httpOnly: this.config.cookie.httpOnly,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
      path: this.config.cookie.path,
      maxAge: this.config.refreshTokenExpiresIn * 1000,
    });
    return { token };
  }
}
