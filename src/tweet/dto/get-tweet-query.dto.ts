import { IntersectionType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

class GetTweetBaseDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Initial date to filter tweets',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  startdate?: Date;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Final date to filter tweets',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  enddate?: Date;
}

export class GetTweetQueryDto extends IntersectionType(
  GetTweetBaseDto,
  PaginationQueryDto,
) {}
