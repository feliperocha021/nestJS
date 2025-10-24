import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { HashtagResponseDto } from 'src/hashtag/dto/hashtag-response.dto';
import { UserListDto } from 'src/user/dto/user-list.dto';

export class TweetResponseDto {
  @ApiProperty({
    example: 'example: 1',
    description: 'Tweet id',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'My first tweet',
    description: 'Tweet content',
  })
  @Expose()
  text: string;

  @ApiProperty({
    example: 'https://meu-bucket-s3.s3.amazonaws.com/tweets/imagem.png',
    description: 'URL of the image associated with the tweet ',
    nullable: true,
  })
  @Expose()
  image: string;

  @ApiProperty({
    example: '2025-10-22T15:42:00Z',
    description: 'Date the tweet was created',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-22T16:00:00Z',
    description: 'Date of last tweet update',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'User who created the tweet',
    type: () => UserListDto,
  })
  @Expose()
  @Type(() => UserListDto)
  user: UserListDto;

  @ApiPropertyOptional({
    description: 'List of hashtags associated with the tweet',
    type: () => [HashtagResponseDto],
  })
  @Expose()
  @Type(() => HashtagResponseDto)
  hashtags?: HashtagResponseDto[];
}
