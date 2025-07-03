import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  @Get()
  getUsers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    console.log(`limit: ${limit}, page:${page}`);
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Query('gender') gender?: string,
  ) {
    return { id, name, gender };
  }

  @Post()
  createUser(@Body() user: CreateUserDto) {
    // this.usersService.createUser(user);
    console.log(user instanceof CreateUserDto);
    return 'A new user has been created!';
  }
}
