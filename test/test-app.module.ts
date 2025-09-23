import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

import { PostgresTestModule } from './postgres-test.module';
import { RedisTestModule } from './redis-test.module';

import { UserModule } from '../src/user/user.module';
import { AuthModule } from '../src/auth/auth.module';
import { TweetModule } from '../src/tweet/tweet.module';
import { ProfileModule } from '../src/profile/profile.module';
import { HashtagModule } from '../src/hashtag/hashtag.module';
import { PaginationModule } from '../src/common/pagination/pagination.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from 'src/s3/s3.module';
import { LambdaModule } from 'src/lambda/lambda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test.local',
    }),
    PostgresTestModule,
    RedisTestModule,
    AuthModule,
    UserModule,
    TweetModule,
    ProfileModule,
    HashtagModule,
    PaginationModule,
    S3Module,
    LambdaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class TestAppModule {}
