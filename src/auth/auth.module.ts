import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [ConfigModule.forFeature(authConfig)],
  exports: [],
})
export class AuthModule {}
