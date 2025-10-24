import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { plainToInstance } from 'class-transformer';
import { HashtagResponseDto } from './dto/hashtag-response.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
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
  ApiConflictError,
  ApiInternalServerError,
  ApiNotFoundError,
  ApiUnauthorizedError,
} from 'src/common/decorators/api-errors.decorators';
import { PaginatedHashtagResponseDto } from './dto/paginated-hashtag-response.dto';

@ApiTags('Hashtags')
@ApiBearerAuth('JWT-auth')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get()
  @ApiOperation({ summary: 'List all hashtags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of hashtags',
    type: PaginatedHashtagResponseDto,
  })
  @ApiBadRequestError('Invalid pagination parameters')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  public async getAllHashtags(
    @Req() req: Request,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    const { data, meta } =
      await this.hashtagService.getAllHashtags(paginationDto);

    const dtos = plainToInstance(HashtagResponseDto, data, {
      excludeExtraneousValues: true,
    });

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
  @ApiOperation({ summary: 'Create a new hashtag' })
  @ApiResponse({
    status: 201,
    description: 'Hashtag successfully created',
    type: HashtagResponseDto,
  })
  @ApiBadRequestError('Invalid data')
  @ApiConflictError('Hashtag already exists')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  public async createHashtag(@Body() hashtag: CreateHashtagDto) {
    const hashtagCreated = await this.hashtagService.createHashtag(hashtag);
    const response = plainToInstance(HashtagResponseDto, hashtagCreated, {
      excludeExtraneousValues: true,
    });
    return response;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletes a hashtag by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Hashtag successfully deleted',
  })
  @ApiNotFoundError('Hashtag not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  public async deleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    return await this.hashtagService.deleteHashtag(hashtagId);
  }

  @Delete('soft-delete/:id')
  @ApiOperation({ summary: 'Soft delet a hashtag by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Hashtag marked as deleted',
  })
  @ApiNotFoundError('Hashtag not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  public async softDeleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    return await this.hashtagService.softDeleteHashtag(hashtagId);
  }
}
