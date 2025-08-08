import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { UserModule } from 'src/user/user.modules';
import { HashtagModule } from 'src/hashtag/hashtag.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [TweetController],
  providers: [TweetService],
  imports: [
    UserModule,
    HashtagModule,
    PaginationModule,
    TypeOrmModule.forFeature([Tweet]),
  ],
  exports: [TweetService],
})
export class TweetModule {}
