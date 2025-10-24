import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty({ example: 10 })
  itemsPerPage: number;

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class LinksDto {
  @ApiProperty({
    example: 'http://localhost:3000/api/v1/resource?limit=10&page=1',
  })
  first: string;

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/resource?limit=10&page=10',
  })
  last: string;

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/resource?limit=10&page=1',
  })
  current: string;

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/resource?limit=10&page=2',
  })
  next: string;

  @ApiProperty({
    example: 'http://localhost:3000/api/v1/resource?limit=10&page=1',
  })
  previous: string;
}

/**
 * Generic paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: MetaDto })
  meta: MetaDto;

  @ApiProperty({ type: LinksDto })
  links: LinksDto;
}
