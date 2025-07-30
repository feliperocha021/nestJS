import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.modules';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { PaginationModule } from './common/pagination/dto/pagination.module';

import { User } from './users/user.entity';
import { Profile } from './profile/profile.entity';
import { Tweet } from './tweet/tweet.entity';
import { Hashtag } from './hashtag/hashtag.entity';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import envValidator from './config/env.validation';

import { APP_GUARD } from '@nestjs/core';
import { AuthorizeGuard } from './auth/guards/authorize.guard';

const ENV = process.env.NODE_ENV;
const envPath = ENV ? `.env.${ENV.trim()}.local` : '.env';

@Module({
  imports: [
    UsersModule,
    TweetModule,
    AuthModule,
    ProfileModule,
    PaginationModule,
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
    HashtagModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Garante aplicação do cookie-parser em todas as rotas
    consumer.apply().forRoutes('*');
  }
}
