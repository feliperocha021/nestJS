import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from './pagination-query.dto';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class PaginationProvider {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    where?: FindOptionsWhere<T>,
  ) {
    const page = paginationQueryDto.page ?? 1;
    const limit = paginationQueryDto.limit ?? 10;

    return await repository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
