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
    return this.users.filter((el) => el.id === id);
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
