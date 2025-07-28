import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AllowAnonymous } from './decorators/allow-anonymous.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() user: LoginDto) {
    return await this.authService.login(user);
  }

  @AllowAnonymous()
  @Post('signup')
  public async signup(@Body() userDto: CreateUserDto) {
    return await this.authService.signup(userDto);
  }

  @AllowAnonymous()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }
}
