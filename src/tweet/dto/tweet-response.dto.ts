import { Expose, Type } from 'class-transformer';
import { HashtagResponseDto } from 'src/hashtag/dto/hashtag-response.dto';
import { UserListDto } from 'src/user/dtos/user-list.dto';

export class TweetResponseDto {
  @Expose()
  id: number;

  @Expose()
  text: string;

  @Expose()
  image?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserListDto)
  user: UserListDto;

  @Expose()
  @Type(() => HashtagResponseDto)
  hashtags: HashtagResponseDto[];
}
