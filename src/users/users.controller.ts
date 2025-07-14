import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return await this.usersService.createUser(user);
  }

  @Patch(':id/profile')
  async createProfileUser(
    @Body() profile: UpdateProfileDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.usersService.updateProfile(id, profile);
  }
}
