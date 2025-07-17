import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { Profile } from 'src/profile/profile.entity';

@Injectable() // faz com que ele possa ser fornecido em qualquer outra classe
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  getAllUsers() {
    return this.userRepository.find({
      relations: ['profile'],
    });
  }

  public async createUser(userDto: CreateUserDto) {
    // usuário existe?
    const userByEmail = await this.userRepository.findOne({
      where: { email: userDto.email },
    });

    const userByUsername = await this.userRepository.findOne({
      where: { username: userDto.username },
    });

    if (userByEmail) {
      return 'Email already in use';
    }
    if (userByUsername) {
      return 'Username already in use';
    }

    // Separar dados
    const { profile: profileDto, ...userData } = userDto;

    // Criando o usuário
    const newUser = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(newUser);

    // Criando perfil vazio vinculado ao usuário
    const profileData = {
      ...(profileDto || {}),
      user: savedUser,
    };
    const newProfile = this.profileRepository.create(profileData);
    await this.profileRepository.save(newProfile);

    return savedUser;
  }

  public async updateProfile(id: number, profileDto: CreateProfileDto) {
    // perfil existe para esse usuário?
    const profile = await this.profileRepository.findOne({
      where: { user: { id } },
      relations: ['user'],
    });

    if (!profile) {
      return 'Profile not found';
    }

    Object.assign(profile, profileDto);
    return await this.profileRepository.save(profile);
  }

  public async deleteUser(id: number) {
    // encontrar o usuário
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['profile'],
    });

    // deletar o perfil antes, pois ele possui uma chave estrangeira do usuário
    if (user?.profile) {
      await this.profileRepository.delete(user.profile.id);
    }

    // deletar o usuário
    await this.userRepository.delete(id);

    return { delete: true };
  }
}
