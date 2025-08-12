import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    ProfileModule,
    PaginationModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [UserService],
})
export class UserModule {}
