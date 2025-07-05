import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TweetService {
  constructor(private readonly userService: UsersService) {}
  tweets: {
    text: string;
    date: Date;
    userId: number;
  }[] = [
    {
      text: 'some tweet',
      date: new Date('2025-07-05'),
      userId: 1,
    },
    {
      text: 'some tweet2',
      date: new Date('2025-07-07'),
      userId: 1,
    },
    {
      text: 'some tweet3',
      date: new Date('2025-07-08'),
      userId: 2,
    },
  ];

  getTweetsUser(userId: number) {
    const user = this.userService.getUserById(userId);
    if (!user) {
      throw new Error('Usuário não existe');
    }
    const tweets = this.tweets.filter((el) => el.userId === userId);
    const response = tweets.map((el) => {
      return {
        text: el.text,
        date: el.date,
        name: user.name,
      };
    });
    return response;
  }
}
