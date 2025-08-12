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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
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
    @Req() req: Request,
    @ActiveUser('sub') userId: number,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    // Busca dados e meta pelo service
    const { data, meta } = await this.tweetService.getTweetsByUser(
      userId,
      paginationDto,
    );

    // Converte entidades para DTOs
    const dtos = plainToInstance(TweetResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // Monta links de paginação no controller
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const path = req.baseUrl + req.path;
    const mk = (p: number) =>
      `${baseUrl}${path}?limit=${meta.itemsPerPage}&page=${p}`;

    const links = {
      first: mk(1),
      last: mk(meta.totalPages),
      current: mk(meta.currentPage),
      next: mk(Math.min(meta.totalPages, meta.currentPage + 1)),
      previous: mk(Math.max(1, meta.currentPage - 1)),
    };

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
