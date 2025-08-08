import { Expose } from 'class-transformer';

export class HashtagResponseDto {
  @Expose() id: number;
  @Expose() name: string;
}
