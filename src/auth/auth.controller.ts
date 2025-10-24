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
import { CreateUserDto } from 'src/user/dto/create-user.dto';
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiBadRequestError,
  ApiConflictError,
  ApiInternalServerError,
  ApiUnauthorizedError,
} from 'src/common/decorators/api-errors.decorators';

@ApiTags('Auth')
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
  @ApiOperation({
    summary:
      'Authenticates the user and returns the JWT in the body and refresh token in an HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        token: 'your-token',
      },
    },
  })
  @ApiBadRequestError('Invalid data')
  @ApiConflictError('User already exists')
  @ApiInternalServerError()
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
  @ApiOperation({
    summary:
      'Creates a new user and returns the JWT in the body and refresh token in an HttpOnly cookie.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: { token: 'your-token' },
    },
  })
  @ApiBadRequestError('Invalid data')
  @ApiConflictError('User already exists')
  @ApiInternalServerError()
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'user logout',
    description:
      'Necessário enviar o **access token** no header bearer Authorization e possuir um **refresh token** válido no cookie HttpOnly.',
  })
  @ApiResponse({
    status: 204,
    description: 'Logout successful',
  })
  @ApiUnauthorizedError()
  public async logout(
    @Req() req: Request & { user: RefreshTokenPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user);
    clearRefreshTokenCookies(res);
    return { logout: true };
  }

  @AllowAnonymous()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generates a new access token from the refresh token',
    description:
      'A valid refresh token is required in the HttpOnly cookie. The access token is not required on this route.',
  })
  @ApiResponse({
    status: 200,
    description: 'New token successfully generated',
    schema: {
      example: { token: 'your-token' },
    },
  })
  @ApiUnauthorizedError()
  @ApiInternalServerError()
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
