import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTweetDto {
  @ApiProperty({
    example: 'My first tweet!',
    description: 'Tweet content',
    maxLength: 280,
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({
    example: 'https://meu-bucket-s3.s3.amazonaws.com/tweets/imagem.png',
    description: 'URL of the image associated with the tweet',
    nullable: true,
  })
  @IsOptional()
  image?: string | null;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'List of hashtag IDs associated with the tweet',
    type: [Number],
  })
  @IsOptional()
  @IsInt({ each: true }) // Valide cada item dentro do array para ver se é um inteiro.
  @IsArray()
  hashtags?: number[];
}
