import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TweetListDto } from 'src/tweet/dto/tweet-list.dto';

export class HashtagResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Hashtag id',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Typescript',
    description: 'Hashtag name',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'List of tweets associated with the hashtag',
    type: () => [TweetListDto],
  })
  @Expose()
  @Type(() => TweetListDto)
  tweets?: TweetListDto[];
}
