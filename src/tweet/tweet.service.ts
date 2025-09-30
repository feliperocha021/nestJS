import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';
import { Paginated } from 'src/common/pagination/pagination.interface';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly userService: UserService,
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

  public async createTweetOfUser(userId: number, tweetDto: CreateTweetDto) {
    // verificando usuário
    const user = await this.userService.findUserById(userId);

    // selecionando todas as hashtags
    const hashtags = tweetDto.hashtags
      ? await this.hashtagService.findHashtags(tweetDto.hashtags)
      : undefined;

    if (tweetDto.hashtags?.length !== hashtags?.length) {
      throw new BadRequestException();
    }

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

  public async updateTweet(
    userId: number,
    tweetId: number,
    tweetDto: UpdateTweetDto,
  ) {
    // verificando se o tweet existe
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
      relations: ['user'],
    });
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${tweetId} does not exist`);
    }

    // verificando se o tweet pertence ao usuário
    if (tweet.user?.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this tweet.',
      );
    }

    // selecionando todas as hashtags
    const hashtags = tweetDto.hashtags
      ? await this.hashtagService.findHashtags(tweetDto.hashtags)
      : [];

    if (tweetDto.hashtags?.length !== hashtags?.length) {
      throw new BadRequestException('teste');
    }

    // atualizando tweet
    tweet.text = tweetDto.text ?? tweet.text;
    tweet.image = tweetDto.image ?? tweet.image;
    // hashtags será vazio se o usuário quiser removê-la
    tweet.hashtags = hashtags;

    const response = await this.tweetRepository.save(tweet);
    console.log(response);
    return response;
  }

  public async deleteTweet(userId: number, tweetId: number) {
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
      relations: ['user', 'hashtags'],
    });
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${tweetId} does not exist`);
    }

    // verificando se o tweet pertence ao usuário
    if (tweet.user?.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this tweet.',
      );
    }

    // SEM CASCADE
    // tweet.hashtags = [];
    // await this.tweetRepository.save(tweet);
    // return await this.tweetRepository.delete(tweet);

    // COM CASCADE
    await this.tweetRepository.remove(tweet);
    return { delete: true };
  }

  public async getTweetById(id: number) {
    const tweet = await this.tweetRepository.findOne({ where: { id } });
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${id} does not exist`);
    }
    return tweet;
  }
}
