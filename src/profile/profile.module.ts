import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [S3Module, PaginationModule, TypeOrmModule.forFeature([Profile])],
  exports: [ProfileService],
})
export class ProfileModule {}
