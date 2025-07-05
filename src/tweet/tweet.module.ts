import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { UsersModule } from 'src/users/users.modules';

@Module({
  controllers: [TweetController],
  providers: [TweetService],
  imports: [UsersModule],
})
export class TweetModule {}
