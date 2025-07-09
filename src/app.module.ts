import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.modules';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { dataSourceOptions } from './db/data-source';

dotenv.config({ path: './.env' });

@Module({
  imports: [
    UsersModule,
    TweetModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...dataSourceOptions,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
