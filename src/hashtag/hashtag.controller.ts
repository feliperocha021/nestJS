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

@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get()
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
  public async createHashtag(@Body() hashtag: CreateHashtagDto) {
    const hashtagCreated = await this.hashtagService.createHashtag(hashtag);
    const response = plainToInstance(HashtagResponseDto, hashtagCreated, {
      excludeExtraneousValues: true,
    });
    return response;
  }

  @Delete(':id')
  public async deleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    return await this.hashtagService.deleteHashtag(hashtagId);
  }

  @Delete('soft-delete/:id')
  public async softDeleteHashtag(@Param('id', ParseIntPipe) hashtagId: number) {
    return await this.hashtagService.softDeleteHashtag(hashtagId);
  }
}
