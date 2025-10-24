import { Expose, Type } from 'class-transformer';
import { Gender } from '../profile.entity';
import { UserListDto } from 'src/user/dto/user-list.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ example: 1, description: 'profile id' })
  @Expose()
  id: number;

  @ApiPropertyOptional({
    example: 'Jhon',
    description: 'First name of user',
  })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Smith',
    description: 'Last name of user',
  })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Gender of user',
    enum: Gender,
  })
  @Expose()
  gender?: Gender;

  @ApiPropertyOptional({
    example: '1995-05-20',
    description: 'Date of birth of the user',
    type: String,
    format: 'date',
  })
  @Expose()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: 'A cool guy',
    description: 'User biography',
  })
  @Expose()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://meu-bucket-s3.s3.amazonaws.com/profiles/image.png',
    description: 'Profile picture URL',
  })
  @Expose()
  profileImage?: string;

  @ApiPropertyOptional({
    description: 'User associated with this profile',
    type: () => UserListDto,
  })
  @Expose()
  @Type(() => UserListDto)
  user?: UserListDto;
}
