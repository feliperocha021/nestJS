import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [PaginationModule, TypeOrmModule.forFeature([Profile])],
  exports: [ProfileService],
})
export class ProfileModule {}
