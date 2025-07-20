import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';

@Controller('tweets')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Get(':id')
  async getTweetsByUser(@Param('id', ParseIntPipe) idUser: number) {
    return await this.tweetService.getTweetsByUser(idUser);
  }

  @Post(':id')
  async createTweetOfUser(
    @Body() tweet: CreateTweetDto,
    @Param('id', ParseIntPipe) idUser: number,
  ) {
    return await this.tweetService.createTweetOfUser(idUser, tweet);
  }

  @Patch(':id')
  async updateTweet(
    @Body() tweet: UpdateTweetDto,
    @Param('id', ParseIntPipe) idTweet: number,
  ) {
    return await this.tweetService.updateTweet(idTweet, tweet);
  }

  @Delete(':id')
  async deleteTweet(@Param('id', ParseIntPipe) idTweet: number) {
    return await this.tweetService.deleteTweet(idTweet);
  }
}
