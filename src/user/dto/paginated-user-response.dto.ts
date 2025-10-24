import { ApiProperty } from '@nestjs/swagger';
import { UserDetailDto } from './user-detail.dto';
import { PaginatedResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

export class PaginatedUserResponseDto extends PaginatedResponseDto<UserDetailDto> {
  @ApiProperty({ type: [UserDetailDto] })
  declare data: UserDetailDto[];
}
