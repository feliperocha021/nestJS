import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() user: LoginDto) {
    return await this.authService.login(user);
  }

  @Post('signup')
  public async signup(@Body() userDto: CreateUserDto) {
    return await this.authService.signup(userDto);
  }
}
