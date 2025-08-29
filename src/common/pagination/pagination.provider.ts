import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Paginated } from './pagination.interface';

@Injectable()
export class PaginationProvider {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    where?: FindOptionsWhere<T>,
    relations?: string[],
  ): Promise<Paginated<T>> {
    const page = paginationQueryDto.page ?? 1;
    const limit = paginationQueryDto.limit ?? 10;

    const findOptions: FindManyOptions<T> = {
      skip: (page - 1) * limit,
      take: limit,
      where,
      relations,
    };

    // Buscar dados e total em paralelo e contar com o mesmo "where"
    const [data, totalItems] = await Promise.all([
      repository.find(findOptions),
      repository.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    // Links ficam a cargo do controller (onde existe req)
    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
      },
      links: undefined,
    };
  }
}
