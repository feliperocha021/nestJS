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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDetailDto } from './dto/user-detail.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import {
  ApiBadRequestError,
  ApiConflictError,
  ApiInternalServerError,
  ApiNotFoundError,
  ApiUnauthorizedError,
} from 'src/common/decorators/api-errors.decorators';
import { PaginatedUserResponseDto } from './dto/paginated-user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users',
    type: PaginatedUserResponseDto,
  })
  @ApiBadRequestError('Invalid pagination parameters')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
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
  @ApiOperation({ summary: 'Returns the data of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDetailDto,
  })
  @ApiNotFoundError('User not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  async getUserById(@ActiveUser('sub') id: number) {
    const user = await this.userService.findUserById(id);
    return plainToInstance(UserDetailDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserDetailDto,
  })
  @ApiBadRequestError('Dados inválidos')
  @ApiConflictError('User already exists')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
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
  @ApiOperation({ summary: 'Deletes the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
  })
  @ApiNotFoundError('User not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  async deleteUser(@ActiveUser('sub') id: number) {
    return await this.userService.deleteUser(id);
  }
}
