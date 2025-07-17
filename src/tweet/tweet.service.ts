import { Injectable } from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async createTweetOfUser(id: number, tweetDto: CreateTweetDto) {
    // verificando usuário
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      return 'user not found';
    }

    // criando tweet de usuário
    const tweetData = {
      ...tweetDto,
      user,
    };

    const newTweet = this.tweetRepository.create(tweetData);
    const saveTweet = await this.tweetRepository.save(newTweet);

    return saveTweet;
  }
}
