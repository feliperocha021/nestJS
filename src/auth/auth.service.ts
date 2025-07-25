import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
  ) {}

  public async login(loginDto: LoginDto) {
    // encontrar usuário
    const user = await this.userService.findUserByUsername(loginDto.username);

    // comparar a senha
    let isEqual: boolean = false;
    isEqual = await this.hashingProvider.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }

    // criando jwt
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
      },
      {
        secret: this.authConfiguration.secret,
        expiresIn: this.authConfiguration.expiresIn,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer,
      },
    );
    return {
      token: token,
    };
  }

  public async signup(userDto: CreateUserDto) {
    return await this.userService.createUser(userDto);
  }
}
