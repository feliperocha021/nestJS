import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Gender } from '../user.entity';

export class CreateUserDto {
  @IsString({ message: 'first name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, {
    message: 'first name should have a minimum of 3 characteres.',
  })
  @MaxLength(20, {
    message: 'first name should have a maximum of 20 characteres.',
  })
  firstName: string;

  @IsString({ message: 'last name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, {
    message: 'last name should have a minimum of 3 characteres.',
  })
  @MaxLength(30, {
    message: 'last name should have a maximum of 30 characteres.',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'gender should have a maximum of 100 characteres.',
  })
  email: string;

  @IsOptional()
  @MaxLength(20, {
    message: 'gender should have a maximum of 20 characteres.',
  })
  @IsEnum(Gender, {
    message: 'gender must be either male, female, or orther',
  })
  gender?: Gender;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'password name should have a minimum of 3 characteres.',
  })
  @MaxLength(16, {
    message: 'gender should have a maximum of 16 characteres.',
  })
  password: string;
}
