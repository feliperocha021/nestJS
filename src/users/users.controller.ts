import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { CreateTweetDto } from 'src/tweet/dto/create-tweet.dto';
import { TweetService } from 'src/tweet/tweet.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private tweetService: TweetService,
  ) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return await this.usersService.createUser(user);
  }

  @Post(':id/tweet')
  async createTweetOfUser(
    @Body() tweet: CreateTweetDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.tweetService.createTweetOfUser(id, tweet);
  }

  @Patch(':id/profile')
  async updateProfileUser(
    @Body() profile: UpdateProfileDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersService.updateProfile(id, profile);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteUser(id);
  }
}
