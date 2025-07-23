import { Injectable } from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { PaginationProvider } from 'src/common/pagination/dto/pagination.provider';
import { Paginated } from 'src/common/pagination/dto/pagination.interface';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly userService: UsersService,
    private readonly hashtagService: HashtagService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getTweetsByUser(
    userId: number,
    paginationDto: PaginationQueryDto,
  ): Promise<Paginated<Tweet>> {
    // verificando usuário
    await this.userService.findUserById(userId);

    //consulta
    return await this.paginationProvider.paginateQuery(
      paginationDto,
      this.tweetRepository,
      { user: { id: userId } },
    );
  }

  public async createTweetOfUser(id: number, tweetDto: CreateTweetDto) {
    // verificando usuário
    const user = await this.userService.findUserById(id);

    // selecionando todas as hashtags
    const hashtags = tweetDto.hashtags
      ? await this.hashtagService.findHashtags(tweetDto.hashtags)
      : [];

    // criando tweet de usuário
    const tweetData = {
      ...tweetDto,
      user,
      hashtags,
    };

    const newTweet = this.tweetRepository.create(tweetData);
    const saveTweet = await this.tweetRepository.save(newTweet);

    return saveTweet;
  }

  public async updateTweet(id: number, tweetDto: UpdateTweetDto) {
    // verificando se o tweet existe
    const tweet = await this.tweetRepository.findOneBy({ id });
    if (!tweet) {
      return 'tweet not found';
    }

    // selecionando todas as hashtags
    const hashtags = tweetDto.hashtags
      ? await this.hashtagService.findHashtags(tweetDto.hashtags)
      : [];

    // atualizando tweet
    tweet.text = tweetDto.text ?? tweet.text;
    tweet.image = tweetDto.image ?? tweet.image;
    tweet.hashtags = hashtags;

    return await this.tweetRepository.save(tweet);
  }

  public async deleteTweet(id: number) {
    const tweet = await this.tweetRepository.findOne({
      where: { id: id },
      relations: ['hashtags'],
    });
    if (!tweet) {
      return 'tweet not found';
    }

    // SEM CASCADE
    // tweet.hashtags = [];
    // await this.tweetRepository.save(tweet);
    // return await this.tweetRepository.delete(tweet);

    // COM CASCADE
    return await this.tweetRepository.remove(tweet);
  }
}
