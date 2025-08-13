import { Expose } from 'class-transformer';

export class TweetListDto {
  @Expose()
  id: number;

  @Expose()
  text: string;

  @Expose()
  image?: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
