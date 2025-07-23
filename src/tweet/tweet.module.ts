import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { UsersModule } from 'src/users/users.modules';
import { HashtagModule } from 'src/hashtag/hashtag.module';
import { PaginationModule } from 'src/common/pagination/dto/pagination.module';

@Module({
  controllers: [TweetController],
  providers: [TweetService],
  imports: [
    UsersModule,
    HashtagModule,
    PaginationModule,
    TypeOrmModule.forFeature([Tweet]),
  ],
  exports: [TweetService],
})
export class TweetModule {}
