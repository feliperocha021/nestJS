import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/pagination.interface';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getAllProfiles(
    paginationDto: PaginationQueryDto,
  ): Promise<Paginated<Profile>> {
    return await this.paginationProvider.paginateQuery(
      paginationDto,
      this.profileRepository,
      undefined,
      ['user'],
    );
  }

  public async createProfile(profileDto: CreateProfileDto) {
    const newProfile = this.profileRepository.create(profileDto);
    return await this.profileRepository.save(newProfile);
  }

  public async updateProfile(userId: number, profileDto: CreateProfileDto) {
    // perfil existe para esse usuário?
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
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
