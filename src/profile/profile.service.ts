import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  public async getAllProfiles() {
    return this.profileRepository.find({
      relations: ['user'],
    });
  }

  public async createProfile(profileDto: CreateProfileDto) {
    const newProfile = this.profileRepository.create(profileDto);
    return await this.profileRepository.save(newProfile);
  }

  public async updateProfile(id: number, profileDto: CreateProfileDto) {
    // perfil existe para esse usuário?
    const profile = await this.profileRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('This profile does not exist');
    }

    Object.assign(profile, profileDto);
    return await this.profileRepository.save(profile);
  }

  public async deleteProfile(id: number) {
    const profile = await this.profileRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException(`This profile with id ${id} does not exist`);
    }

    return await this.profileRepository.delete(id);
  }
}
