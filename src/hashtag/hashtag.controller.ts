import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';

@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Post()
  public async createHashtag(@Body() hashtag: CreateHashtagDto) {
    return this.hashtagService.createHashtag(hashtag);
  }

  @Delete(':id')
  public async deleteHashtag(@Param('id', ParseIntPipe) idHashtag: number) {
    return await this.hashtagService.deleteHashtag(idHashtag);
  }

  @Delete('soft-delete/:id')
  public async softDeleteHashtag(@Param('id', ParseIntPipe) idHashtag: number) {
    return await this.hashtagService.softDeleteHashtag(idHashtag);
  }
}
