import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TweetService } from './tweet.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('tweets')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Get()
  async getTweetsByUser(
    @ActiveUser('sub') userId: number,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return await this.tweetService.getTweetsByUser(userId, paginationDto);
  }

  @Post()
  async createTweetOfUser(
    @Body() tweet: CreateTweetDto,
    @ActiveUser('sub') userId: number,
  ) {
    return await this.tweetService.createTweetOfUser(userId, tweet);
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
