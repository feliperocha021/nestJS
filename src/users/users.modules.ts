import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { PaginationModule } from 'src/common/pagination/dto/pagination.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    ProfileModule,
    PaginationModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, Profile]),
  ],
  exports: [UsersService],
})
export class UsersModule {}
