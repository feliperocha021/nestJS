import {
  Controller,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  //UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
//import { AuthorizeGuard } from 'src/auth/guards/authorize.guard';

@Controller('users')
//@UseGuards(AuthorizeGuard) // todas as rotas protegidas(requerem autenticação)
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
