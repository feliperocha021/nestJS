import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.modules';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { HashtagModule } from './hashtag/hashtag.module';

import { User } from './users/user.entity';
import { Profile } from './profile/profile.entity';
import { Tweet } from './tweet/tweet.entity';
import { Hashtag } from './hashtag/hashtag.entity';

const ENV = process.env.NODE_ENV;
const envPath = ENV ? `.env.${ENV.trim()}.local` : '.env';

@Module({
  imports: [
    UsersModule,
    TweetModule,
    AuthModule,
    ProfileModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envPath],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: parseInt(config.get<string>('POSTGRES_PORT') || '5432'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        entities: [User, Profile, Tweet, Hashtag],
        migrations: ['dist/db/migrations/*.js'],
        synchronize: false,
      }),
    }),
    HashtagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
