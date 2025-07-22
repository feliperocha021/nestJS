import {
  HttpException,
  HttpStatus,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { ProfileService } from 'src/profile/profile.service';
import { UserAlreadyExistsException } from 'src/customExceptions/user-arealdy-exists.exception';

@Injectable() // faz com que ele possa ser fornecido em qualquer outra classe
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly profileService: ProfileService,
  ) {}

  public async getAllUsers() {
    try {
      return await this.userRepository.find({
        relations: ['profile'],
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ENCONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has occurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
    }
  }

  public async createUser(userDto: CreateUserDto) {
    try {
      // usuário existe?
      const usernameExist = await this.userRepository.findOne({
        where: { username: userDto.username },
      });

      const emailExist = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (usernameExist) {
        throw new UserAlreadyExistsException('username', userDto.username);
      }

      if (emailExist) {
        throw new UserAlreadyExistsException('email', userDto.email);
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
      await this.profileService.createProfile(profileData);

      return savedUser;
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ENCONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      throw error;
    }
  }

  public async deleteUser(id: number) {
    // encontrar o usuário
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['profile'],
    });

    // deletar o perfil antes, pois ele possui uma chave estrangeira do usuário
    if (user?.profile) {
      await this.profileService.deleteProfile(user.profile.id);
    }

    // deletar o usuário
    await this.userRepository.delete(id);

    return { delete: true };
  }

  public async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `The user with id ${id} was not found`,
        },
        HttpStatus.NOT_FOUND,
        {
          description: `The user with id ${id} was not found in user table`,
        },
      );
    }
    return user;
  }
}
