import { Expose, Type } from 'class-transformer';
import { TweetListDto } from 'src/tweet/dto/tweet-list.dto';

export class HashtagResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  @Type(() => TweetListDto)
  tweets?: TweetListDto[];
}
