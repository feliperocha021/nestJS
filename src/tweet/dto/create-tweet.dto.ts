import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTweetDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsInt({ each: true }) // Valide cada item dentro do array para ver se é um inteiro.
  @IsArray()
  hashtags?: number[];
}
