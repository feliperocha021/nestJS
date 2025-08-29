import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './hashtag.entity';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  providers: [HashtagService],
  controllers: [HashtagController],
  imports: [PaginationModule, TypeOrmModule.forFeature([Hashtag])],
  exports: [HashtagService],
})
export class HashtagModule {}
