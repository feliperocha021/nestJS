import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiBadRequestError,
  ApiInternalServerError,
  ApiNotFoundError,
  ApiUnauthorizedError,
} from 'src/common/decorators/api-errors.decorators';
import { PaginatedProfileResponseDto } from './dto/paginated-profile-response.dto';

@ApiTags('Profiles')
@ApiBearerAuth('JWT-auth')
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all profiles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of profiles',
    type: PaginatedProfileResponseDto,
  })
  @ApiBadRequestError('Invalid pagination parameters')
  @ApiInternalServerError()
  @ApiUnauthorizedError()
  public async getAllProfiles(
    @Req() req: Request,
    @Query() paginateDto: PaginationQueryDto,
  ) {
    // Busca dados + meta pelo service
    const { data, meta } =
      await this.profileService.getAllProfiles(paginateDto);

    // Converte entidades para DTOs
    const dtos = plainToInstance(ProfileResponseDto, data, {
      excludeExtraneousValues: true,
    });

    // Monta os links de paginação usando req
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

  @Patch('me')
  @ApiOperation({ summary: 'Updates the profile from the authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: ProfileResponseDto,
  })
  @ApiNotFoundError('Profile not found')
  @ApiInternalServerError()
  @ApiUnauthorizedError()
  public async updateProfileUser(
    @Body() profile: UpdateProfileDto,
    @ActiveUser('sub') userId: number,
  ) {
    const updated = await this.profileService.updateProfile(userId, profile);
    return plainToInstance(ProfileResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  @Post('me/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload the profile image of the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Profile picture successfully sent',
    schema: {
      example: { fileKey: 'profiles/12345-avatar.png' },
    },
  })
  @ApiBadRequestError('Invalid or missing file')
  @ApiNotFoundError('Profile not found')
  @ApiUnauthorizedError()
  @ApiInternalServerError()
  public async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser('sub') userId: number,
  ) {
    const fileKey = await this.s3Service.uploadProfileImage(file);
    await this.profileService.updateProfileImage(userId, fileKey);
    return { fileKey };
  }
}
