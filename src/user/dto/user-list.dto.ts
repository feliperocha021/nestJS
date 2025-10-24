import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserListDto {
  @ApiProperty({ example: 1, description: 'user id' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'jhon123', description: 'username' })
  @Expose()
  username: string;
}
