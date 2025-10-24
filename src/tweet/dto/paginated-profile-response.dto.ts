import { ApiProperty } from '@nestjs/swagger';
import { TweetResponseDto } from './tweet-response.dto';
import { PaginatedResponseDto } from 'src/common/pagination/dto/pagination-response.dto';

export class PaginatedTweetResponseDto extends PaginatedResponseDto<TweetResponseDto> {
  @ApiProperty({ type: [TweetResponseDto] })
  declare data: TweetResponseDto[];
}
