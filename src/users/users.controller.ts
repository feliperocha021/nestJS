import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    const usersService = new UsersService();
    return usersService.getAllUsers();
  }

  @Get(':id/:name')
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Param('name') name: string,
    @Query('gender') gender?: string,
  ) {
    return { id, name, gender };
  }

  @Post()
  createUser() {
    const user = {
      id: 3,
      name: 'merry',
      age: 30,
      gender: 'female',
      isMarried: true,
    };
    const usersService = new UsersService();
    usersService.createUser(user);
    return usersService.getUserById(user.id);
  }
}
