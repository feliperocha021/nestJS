import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { TweetModule } from 'src/tweet/tweet.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TweetModule, TypeOrmModule.forFeature([User, Profile])],
  exports: [],
})
export class UsersModule {}
