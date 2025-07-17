import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Tweet } from './tweet.entity';

@Module({
  controllers: [TweetController],
  providers: [TweetService],
  imports: [TypeOrmModule.forFeature([User, Tweet])],
  exports: [TweetService],
})
export class TweetModule {}
