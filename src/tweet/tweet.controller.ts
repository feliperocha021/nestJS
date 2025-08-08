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
import { plainToInstance } from 'class-transformer';
import { TweetResponseDto } from './dto/tweet-response.dto';

@Controller('tweets')
export class TweetController {
  constructor(private readonly tweetService: TweetService) {}

  @Get()
  async getTweetsByUser(
    @ActiveUser('sub') userId: number,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    const { data, meta, links } = await this.tweetService.getTweetsByUser(
      userId,
      paginationDto,
    );
    const dtos = plainToInstance(TweetResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return { data: dtos, meta, links };
  }

  @Post()
  async createTweetOfUser(
    @Body() tweet: CreateTweetDto,
    @ActiveUser('sub') userId: number,
  ) {
    const created = await this.tweetService.createTweetOfUser(userId, tweet);

    return plainToInstance(TweetResponseDto, created, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async updateTweet(
    @Body() tweet: UpdateTweetDto,
    @Param('id', ParseIntPipe) idTweet: number,
  ) {
    const updated = await this.tweetService.updateTweet(idTweet, tweet);

    return plainToInstance(TweetResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async deleteTweet(@Param('id', ParseIntPipe) idTweet: number) {
    return await this.tweetService.deleteTweet(idTweet);
  }
}
