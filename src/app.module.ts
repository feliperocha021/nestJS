import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { PaginationModule } from './common/pagination/pagination.module';

import { User } from './user/user.entity';
import { Profile } from './profile/profile.entity';
import { Tweet } from './tweet/tweet.entity';
import { Hashtag } from './hashtag/hashtag.entity';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import envValidator from './config/env.validation';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

const ENV = process.env.NODE_ENV;
const envPath = ENV ? `.env.${ENV.trim()}.local` : '.env';

@Module({
  imports: [
    UserModule,
    TweetModule,
    AuthModule,
    ProfileModule,
    PaginationModule,
    HashtagModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envPath],
      load: [appConfig, databaseConfig],
      validationSchema: envValidator,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: parseInt(config.get<string>('database.port') || '5432'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [User, Profile, Tweet, Hashtag],
        migrations: ['dist/db/migrations/*.js'],
        synchronize: false,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
