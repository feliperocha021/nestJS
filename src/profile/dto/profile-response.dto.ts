import { Expose, Type } from 'class-transformer';
import { Gender } from '../profile.entity';
import { UserListDto } from 'src/user/dtos/user-list.dto';

export class ProfileResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName?: string;

  @Expose()
  lastName?: string;

  @Expose()
  gender?: Gender;

  @Expose()
  @Type(() => Date)
  dateOfBirth?: Date;

  @Expose()
  bio?: string;

  @Expose()
  profileImage?: string;

  @Expose()
  @Type(() => UserListDto)
  user?: UserListDto;
}
