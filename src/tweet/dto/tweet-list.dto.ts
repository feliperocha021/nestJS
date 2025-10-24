import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TweetListDto {
  @ApiProperty({
    example: 1,
    description: 'tweet id',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'My first tweet',
    description: 'Tweet content',
  })
  @Expose()
  text: string;

  @ApiPropertyOptional({
    example: 'https://meu-bucket-s3.s3.amazonaws.com/tweets/imagem.png',
    description: 'URL of the image associated with the tweet',
    nullable: true,
  })
  @Expose()
  image?: string | null;

  @ApiProperty({
    example: '2025-10-22T15:42:00Z',
    description: 'Date of tweet creation',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-22T15:42:00Z',
    description: 'Date of last tweet update',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;
}
