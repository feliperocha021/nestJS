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
import { RedisJtiProvider } from './provider/redis-jti.provider';
import { randomUUID } from 'crypto';
import {
  RefreshTokenPayload,
  AccessTokenPayload,
} from './interfaces/user-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
    private readonly redisJtiProvider: RedisJtiProvider,
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
      throw new UnauthorizedException('Incorrect credentials');
    }

    // limpando refreshTokens já expirados
    await this.redisJtiProvider.cleanupExpiredJtis(user.id.toString());

    // criando token de acesso e de atualização jwt
    return await this.generateToken(user);
  }

  public async signup(userDto: CreateUserDto) {
    const user = await this.userService.createUser(userDto);
    return await this.generateToken(user);
  }

  public async refreshToken(payload: RefreshTokenPayload) {
    try {
      const { sub: userId, jti } = payload;

      // verifcando se esse refresh token é o atual pelo jti
      const isValid = await this.redisJtiProvider.isValidJti(
        userId.toString(),
        jti,
      );

      if (!isValid) {
        throw new UnauthorizedException('Refresh token revoked or expired');
      }

      // removendo jti do refresh token atual
      await this.redisJtiProvider.removeJti(userId.toString(), jti);

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

  public async logout(payload: RefreshTokenPayload) {
    const { sub: userId, jti } = payload;
    await this.redisJtiProvider.removeJti(userId.toString(), jti);
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
    // gerar jti do refresh token
    const jti = randomUUID();
    await this.redisJtiProvider.addJti(
      user.id.toString(),
      jti,
      this.authConfiguration.refreshTokenExpiresIn,
    );

    // gerar o token de acesso
    const accessToken = await this.signToken<Partial<AccessTokenPayload>>(
      user.id,
      this.authConfiguration.expiresIn,
      { username: user.username },
    );

    // gerar o token de atualização
    const refreshToken = await this.signToken<Partial<RefreshTokenPayload>>(
      user.id,
      this.authConfiguration.refreshTokenExpiresIn,
      { jti },
    );
    return {
      token: accessToken,
      refreshToken: refreshToken,
    };
  }
}
