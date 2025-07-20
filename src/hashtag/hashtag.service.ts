import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './hashtag.entity';
import { In, Repository } from 'typeorm';
import { CreateHashtagDto } from './dto/create-hashtag.dto';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  public async createHashtag(hashtagDto: CreateHashtagDto) {
    const newHashtag = this.hashtagRepository.create(hashtagDto);

    return await this.hashtagRepository.save(newHashtag);
  }

  public async findHashtags(hashtag: number[]) {
    return await this.hashtagRepository.find({
      where: { id: In(hashtag) },
    });
  }

  public async deleteHashtag(id: number) {
    const hashtag = await this.hashtagRepository.findOne({
      where: { id: id },
      relations: ['tweets'],
    });

    if (!hashtag) {
      return 'hashtag noot found';
    }

    return await this.hashtagRepository.remove(hashtag);
  }
}
