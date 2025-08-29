import {
  Controller,
  Get,
  Delete,
  Query,
  Body,
  Post,
  Req,
  //UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';

import { UserService } from './user.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDetailDto } from './dtos/user-detail.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(
    @Req() req: Request,
    @Query() paginateDto: PaginationQueryDto,
  ) {
    const { data, meta } = await this.userService.getAllUsers(paginateDto);
    // Monta DTOs
    const dtos = plainToInstance(UserDetailDto, data, {
      excludeExtraneousValues: true,
    });

    // Monta os links aqui
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

  @Get('me')
  async getUserById(@ActiveUser('sub') id: number) {
    const user = await this.userService.findUserById(id);
    return plainToInstance(UserDetailDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @AllowAnonymous()
  @Post()
  async createUser(@Body() user: CreateUserDto) {
    const newUser = await this.userService.createUser(user);
    const newUserwithProfile = await this.userService.findUserByIdWithProfile(
      newUser.id,
    );
    return plainToInstance(UserDetailDto, newUserwithProfile, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('me')
  async deleteUser(@ActiveUser('sub') id: number) {
    return await this.userService.deleteUser(id);
  }
}
