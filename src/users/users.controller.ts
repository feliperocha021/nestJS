import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { UsersService } from './users.service';

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
    return this.usersService.getAllUsers();
  }

  @Get(':id/:name')
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Param('name') name: number,
    @Query('gender') gender?: string,
  ) {
    return { id, name, gender };
  }

  @Post()
  createUser() {
    const user = {
      id: 3,
      name: 'merry',
      email: 'merry@gmail.com',
      gender: 'female',
      isMarried: true,
    };
    this.usersService.createUser(user);
    return this.usersService.getUserById(user.id);
  }
}
