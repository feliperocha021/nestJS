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
import { LambdaService } from 'src/lambda/lambda.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiBadRequestError,
  ApiForbiddenError,
  ApiInternalServerError,
  ApiNotFoundError,
  ApiUnauthorizedError,
} from 'src/common/decorators/api-errors.decorators';
import { PaginatedTweetResponseDto } from './dto/paginated-profile-response.dto';

@ApiTags('Tweets')
@ApiBearerAuth('JWT-auth')
@Controller('tweets')
export class TweetController {
  constructor(
    private readonly tweetService: TweetService,
    private readonly lambdaService: LambdaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List the tweets of the authenticate user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of tweets',
    type: PaginatedTweetResponseDto,
  })
  @ApiBadRequestError('Invalid pagination parameters')
  @ApiNotFoundError('User not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
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
  @ApiOperation({ summary: 'Create a new tweet for the authenticate user' })
  @ApiResponse({
    status: 201,
    description: 'Tweet successfully created',
    type: TweetResponseDto,
  })
  @ApiBadRequestError('Invalids Hashtags')
  @ApiNotFoundError('User not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
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
  @ApiOperation({
    summary: 'Update an existing tweet from the authenticate user',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tweet successfully updated',
    type: TweetResponseDto,
  })
  @ApiBadRequestError('Invalid hashtags')
  @ApiNotFoundError('Tweet not found')
  @ApiForbiddenError('The user does not have permission to update this tweet')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  async updateTweet(
    @Body() tweet: UpdateTweetDto,
    @Param('id', ParseIntPipe) tweetId: number,
    @ActiveUser('sub') userId: number,
  ) {
    const updated = await this.tweetService.updateTweet(userId, tweetId, tweet);

    return plainToInstance(TweetResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a tweet from the authenticate user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Tweet successfully removed' })
  @ApiNotFoundError('Tweet not found')
  @ApiForbiddenError('The user does not have permission to update this tweet')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  async deleteTweet(
    @Param('id', ParseIntPipe) tweetId: number,
    @ActiveUser('sub') userId: number,
  ) {
    return await this.tweetService.deleteTweet(userId, tweetId);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze the content of a tweet using Lambda' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Resulted of the analyze from the tweet',
    schema: {
      example: {
        tweetId: 1,
        text: 'Hoje é um bom dia',
        analysis: {
          length: 17,
          words: 5,
          sentiment: 'positivo',
        },
      },
    },
  })
  @ApiNotFoundError('Tweet não encontrado')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  async analyzeTweet(@Param('id', ParseIntPipe) tweetId: number) {
    const tweet = await this.tweetService.getTweetById(tweetId);

    const result = await this.lambdaService.analyzeTweet(tweet.text);

    return {
      tweetId: tweet.id,
      text: tweet.text,
      analysis: result,
    };
  }
}
