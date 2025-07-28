import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UserPayload } from './interfaces/user-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

    // criando token de acesso e de atualização jwt
    return await this.generateToken(user);
  }

  public async signup(userDto: CreateUserDto) {
    const user = await this.userService.createUser(userDto);
    return await this.generateToken(user);
  }

  public async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // verificar o token de atualização
      const payload = await this.jwtService.verifyAsync<
        Pick<UserPayload, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.authConfiguration.secret,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer,
      });
      const userId = payload.sub;

      // encontrar o usuário
      const user = await this.userService.findUserById(userId);

      // gerar token de acesso e de atualização jwt
      return await this.generateToken(user);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ECONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException(error);
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.authConfiguration.secret,
        expiresIn: expiresIn,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer,
      },
    );
  }

  private async generateToken(user: User) {
    // gerar o token de acesso
    const accessToken = await this.signToken<Partial<UserPayload>>(
      user.id,
      this.authConfiguration.expiresIn,
      { username: user.username },
    );

    // gerar o token de atualização
    const refreshToken = await this.signToken(
      user.id,
      this.authConfiguration.refreshTokenExpiresIn,
    );

    return {
      token: accessToken,
      refreshToken: refreshToken,
    };
  }
}
