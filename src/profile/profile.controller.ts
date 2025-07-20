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

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  public getAllProfiles() {
    return this.profileService.getAllProfiles();
  }

  @Patch(':id')
  async updateProfileUser(
    @Body() profile: UpdateProfileDto,
    @Param('id', ParseIntPipe) idUser: number,
  ) {
    return await this.profileService.updateProfile(idUser, profile);
  }
}
