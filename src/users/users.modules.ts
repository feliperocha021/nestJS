import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [ProfileModule, TypeOrmModule.forFeature([User, Profile])],
  exports: [UsersService],
})
export class UsersModule {}
