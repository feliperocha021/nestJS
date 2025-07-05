import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TweetService } from './tweet.service';

@Controller('tweets')
export class TweetController {
  constructor(private tweetService: TweetService) {}

  @Get(':userId')
  public getTweetsUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.tweetService.getTweetsUser(userId);
  }
}
