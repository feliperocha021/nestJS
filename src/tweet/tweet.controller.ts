import { Controller } from '@nestjs/common';
import { TweetService } from './tweet.service';

@Controller('tweets')
export class TweetController {
  constructor(private tweetService: TweetService) {}
}
