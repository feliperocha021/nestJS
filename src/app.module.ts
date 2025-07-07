import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.modules';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    TweetModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true, // deve ser usado apenas em ambiente de desenvolvimento
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'nestjs',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
