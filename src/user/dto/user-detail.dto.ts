import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProfileResponseDto } from 'src/profile/dto/profile-response.dto';

export class UserDetailDto {
  @ApiProperty({ example: 1, description: 'user id' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'jhon123', description: 'username' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'user@email.com', description: 'user email' })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2025-09-22M15:42:00Z',
    description: 'User creation date',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Profile associated with user',
    required: false,
    type: () => ProfileResponseDto,
  })
  @Expose()
  @Type(() => ProfileResponseDto)
  profile?: ProfileResponseDto;
}
