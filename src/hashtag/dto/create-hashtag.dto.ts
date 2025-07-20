import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHashtagDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
