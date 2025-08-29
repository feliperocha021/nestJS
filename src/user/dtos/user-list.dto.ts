import { Expose } from 'class-transformer';

export class UserListDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
}
