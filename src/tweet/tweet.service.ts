import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
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
    try {
      // verificando usuário
      await this.userService.findUserById(userId);

      //consulta
      return await this.paginationProvider.paginateQuery(
        paginationDto,
        this.tweetRepository,
        { user: { id: userId } },
      );
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ECONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      throw error;
    }
  }

  public async createTweetOfUser(userId: number, tweetDto: CreateTweetDto) {
    try {
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
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ECONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      throw error;
    }
  }

  public async updateTweet(id: number, tweetDto: UpdateTweetDto) {
    try {
      // verificando se o tweet existe
      const tweet = await this.tweetRepository.findOneBy({ id });
      if (!tweet) {
        throw new NotFoundException(`Tweet with id ${id} does not exist`);
      }

      // selecionando todas as hashtags
      const hashtags = tweetDto.hashtags
        ? await this.hashtagService.findHashtags(tweetDto.hashtags)
        : [];

      if (tweetDto.hashtags?.length !== hashtags?.length) {
        throw new BadRequestException();
      }

      // atualizando tweet
      tweet.text = tweetDto.text ?? tweet.text;
      tweet.image = tweetDto.image ?? tweet.image;
      // hashtags será vazio se o usuário quiser removê-la
      tweet.hashtags = hashtags;

      return await this.tweetRepository.save(tweet);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ECONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      throw error;
    }
  }

  public async deleteTweet(id: number) {
    try {
      const tweet = await this.tweetRepository.findOne({
        where: { id: id },
        relations: ['hashtags'],
      });
      if (!tweet) {
        throw new NotFoundException(`Tweet with id ${id} does not exist`);
      }

      // SEM CASCADE
      // tweet.hashtags = [];
      // await this.tweetRepository.save(tweet);
      // return await this.tweetRepository.delete(tweet);

      // COM CASCADE
      return await this.tweetRepository.remove(tweet);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ECONNREFUSED') {
          throw new RequestTimeoutException(
            'An error has ocurred. Please try again later.',
            { description: 'Could not connect to database.' },
          );
        }
      }
      throw error;
    }
  }
}
