import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'eemail should have a maximum of 100 characteres.',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, {
    message: 'username should have a maximum of 20 characteres.',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'password name should have a minimum of 3 characteres.',
  })
  @MaxLength(16, {
    message: 'gender should have a maximum of 16 characteres.',
  })
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}
