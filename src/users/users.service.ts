import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable() // faz com que ele possa ser fornecido em qualquer outra classe
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  users: {
    id: number;
    name: string;
    email: string;
    gender: string;
    isMarried: boolean;
    password: string;
  }[] = [
    {
      id: 1,
      name: 'jhon',
      email: 'jhon@gmail.com',
      gender: 'male',
      isMarried: false,
      password: 'dopoda311',
    },
    {
      id: 2,
      name: 'marry',
      email: 'marry@gmail.com',
      gender: 'female',
      isMarried: false,
      password: 'marryzinha123',
    },
  ];
  getAllUsers() {
    if (this.authService.isAuthenticated) {
      return this.users;
    }
    return 'you are not logged';
  }

  getUserById(id: number) {
    return this.users.find((el) => el.id === id);
  }

  createUser(user: {
    id: number;
    name: string;
    email: string;
    gender: string;
    isMarried: boolean;
    password: string;
  }) {
    this.users.push(user);
  }
}
