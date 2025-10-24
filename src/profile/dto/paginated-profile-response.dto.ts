import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponseDto } from './profile-response.dto';
import { PaginatedResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

export class PaginatedProfileResponseDto extends PaginatedResponseDto<ProfileResponseDto> {
  @ApiProperty({ type: [ProfileResponseDto] })
  declare data: ProfileResponseDto[];
}
