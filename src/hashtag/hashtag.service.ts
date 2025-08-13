import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './hashtag.entity';
import { In, IsNull, Repository } from 'typeorm';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/pagination.interface';
import { PaginationProvider } from 'src/common/pagination/pagination.provider';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,

    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getAllHashtags(
    paginationDto: PaginationQueryDto,
  ): Promise<Paginated<Hashtag>> {
    // filtra apenas não removidas logicamente e carrega tweets
    return this.paginationProvider.paginateQuery(
      paginationDto,
      this.hashtagRepository,
      { deletedAt: IsNull() },
      ['tweets'],
    );
  }

  public async createHashtag(hashtagDto: CreateHashtagDto) {
    const newHashtag = this.hashtagRepository.create(hashtagDto);

    const response = await this.hashtagRepository.save(newHashtag);
    console.log(response);
    return response;
  }

  public async findHashtags(hashtag: number[]) {
    const hashtags = await this.hashtagRepository.find({
      where: {
        id: In(hashtag),
        deletedAt: IsNull(),
      },
    });

    if (!hashtags) {
      throw new NotFoundException(
        `Hashtag(s) with id(s) ${hashtag.join(', ')} not found`,
      );
    }
    return hashtags;
  }

  public async deleteHashtag(id: number) {
    const hashtag = await this.hashtagRepository.findOne({
      where: { id: id },
      relations: ['tweets'],
    });

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }

    await this.hashtagRepository.remove(hashtag);

    return { delete: 'true' };
  }

  public async softDeleteHashtag(id: number) {
    const hashtag = await this.hashtagRepository.findOne({
      where: { id: id },
      relations: ['tweets'],
    });

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`);
    }

    await this.hashtagRepository.softRemove(hashtag);

    return { delete: 'true' };
  }
}
