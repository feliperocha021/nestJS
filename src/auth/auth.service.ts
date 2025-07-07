import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  isAuthenticated: boolean = false;

  login(email: string, pswd: string) {
    const user = this.userService.users.find(
      (el) => el.email === email && el.password === pswd,
    );
    if (user) {
      this.isAuthenticated = true;
      return 'TOKEN';
    }
    return 'User does not exist!';
  }
}
