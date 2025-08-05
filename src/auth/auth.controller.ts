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
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenPayload } from './interfaces/user-payload.interface';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookies,
} from './utils/handler-cookies';

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
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.login(dto);
    setRefreshTokenCookie(res, refreshToken);
    return { token };
  }

  @AllowAnonymous()
  @Post('signup')
  public async signup(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken } = await this.authService.signup(dto);
    setRefreshTokenCookie(res, refreshToken);
    return { token };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(204)
  public async logout(
    @Req() req: Request & { user: RefreshTokenPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user);
    clearRefreshTokenCookies(res);
  }

  @AllowAnonymous()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(
    @Req() req: Request & { user: RefreshTokenPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(req.user);

    setRefreshTokenCookie(res, newRefreshToken);
    return { token };
  }
}
