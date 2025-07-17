import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileServie: ProfileService) {}

  @Get()
  public getAllProfiles() {
    return this.profileServie.getAllProfiles();
  }
}
