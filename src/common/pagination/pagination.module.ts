import { Module } from '@nestjs/common';
import { PaginationProvider } from './pagination.provider';

@Module({
  controllers: [],
  providers: [PaginationProvider],
  imports: [],
  exports: [PaginationProvider],
})
export class PaginationModule {}
