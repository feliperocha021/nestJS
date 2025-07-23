import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Query() paginateDto: PaginationQueryDto) {
    return this.usersService.getAllUsers(paginateDto);
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) idUser: number) {
    return this.usersService.findUserById(idUser);
  }

  // @Post()
  // async createUser(@Body() user: CreateUserDto) {
  //   return await this.usersService.createUser(user);
  // }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteUser(id);
  }
}
