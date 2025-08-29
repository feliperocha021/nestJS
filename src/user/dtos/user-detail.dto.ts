import { Expose, Type } from 'class-transformer';
import { ProfileResponseDto } from 'src/profile/dto/profile-response.dto';

export class UserDetailDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ProfileResponseDto)
  profile?: ProfileResponseDto;
}
