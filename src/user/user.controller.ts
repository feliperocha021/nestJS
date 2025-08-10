import {
  Controller,
  Get,
  Delete,
  Query,
  Body,
  Post,
  //UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UserService } from './user.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDetailDto } from './dtos/user-detail.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(@Query() paginateDto: PaginationQueryDto) {
    const { data, meta, links } =
      await this.userService.getAllUsers(paginateDto);
    console.log(data);
    const dtos = plainToInstance(UserDetailDto, data, {
      excludeExtraneousValues: true,
    });
    return { data: dtos, meta, links };
  }

  @Get('me')
  async getUserById(@ActiveUser('sub') id: number) {
    const user = await this.userService.findUserById(id);
    console.log(user);
    return plainToInstance(UserDetailDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    const newUser = await this.userService.createUser(user);
    console.log('newUser');
    console.log(newUser);
    console.log('newUser');
    const newUserwithProfile = await this.userService.findUserByIdWithProfile(
      newUser.id,
    );
    console.log('newUserwithProfile');
    console.log(newUserwithProfile);
    console.log('newUserwithProfile');
    const returnFinal = plainToInstance(UserDetailDto, newUserwithProfile, {
      excludeExtraneousValues: true,
    });
    console.log(returnFinal);
    return returnFinal;
  }

  @Delete('me')
  async deleteUser(@ActiveUser('sub') id: number) {
    const result = await this.userService.deleteUser(id);
    console.log(result);
    return result;
  }
}
