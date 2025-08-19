import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';
import redisConfig, { RedisConfig } from './config/redis.config';
import Redis from 'ioredis';

import { UserModule } from 'src/user/user.module';
import { HashingProvider } from './provider/hashing.provider';
import { BcryptProvider } from './provider/bcrypt.provider';
import { JwtModule } from '@nestjs/jwt';
import { RedisJtiProvider } from './provider/redis-jti.provider';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    RedisJtiProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: RedisConfig): Redis => {
        return new Redis({
          host: config.redisHost,
          port: config.redisPort,
        });
      },
      inject: [redisConfig.KEY],
    },
  ],
  imports: [
    forwardRef(() => UserModule),
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(redisConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
  exports: [AuthService, HashingProvider, JwtModule, 'REDIS_CLIENT'],
})
export class AuthModule {}
