import { Injectable } from '@nestjs/common';

@Injectable() // faz com que ele possa ser fornecido em qualquer outra classe
export class UsersService {
  users: {
    id: number;
    name: string;
    email: string;
    gender: string;
    isMarried: boolean;
  }[] = [
    {
      id: 1,
      name: 'jhon',
      email: 'jhon@gmail.com',
      gender: 'male',
      isMarried: false,
    },
    {
      id: 2,
      name: 'marry',
      email: 'marry@gmail.com',
      gender: 'female',
      isMarried: false,
    },
  ];
  getAllUsers() {
    return this.users;
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
  }) {
    this.users.push(user);
  }
}
