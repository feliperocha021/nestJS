import { ApiProperty } from '@nestjs/swagger';
import { HashtagResponseDto } from './hashtag-response.dto';
import { PaginatedResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

export class PaginatedHashtagResponseDto extends PaginatedResponseDto<HashtagResponseDto> {
  @ApiProperty({ type: [HashtagResponseDto] })
  declare data: HashtagResponseDto[];
}
