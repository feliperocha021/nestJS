import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
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

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
    private readonly redisJtiProvider: RedisJtiProvider,
  ) {}

  public async login(loginDto: LoginDto) {
    const user = await this.userService.findUserByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isEqual = await this.hashingProvider.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    await this.redisJtiProvider.cleanupExpiredJtis(user.id.toString());

    const response = await this.generateToken(user);

    return response;
  }

  public async signup(userDto: CreateUserDto) {
    const user = await this.userService.createUser(userDto);
    return await this.generateToken(user);
  }

  public async refreshToken(payload: RefreshTokenPayload) {
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
  }

  public async logout(payload: RefreshTokenPayload) {
    const { sub: userId, jti } = payload;
    await this.redisJtiProvider.removeJti(userId.toString(), jti);
    return { logout: true };
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
