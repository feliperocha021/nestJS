import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  public async getAllProfiles() {
    const profiles = await this.profileService.getAllProfiles();
    console.log(profiles);
    return plainToInstance(ProfileResponseDto, profiles, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  public async updateProfileUser(
    @Body() profile: UpdateProfileDto,
    @Param('id', ParseIntPipe) idUser: number,
  ) {
    const updated = await this.profileService.updateProfile(idUser, profile);
    return plainToInstance(ProfileResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
