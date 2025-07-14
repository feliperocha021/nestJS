import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/user.entity';

export class CreateProfileDto {
  @IsOptional()
  @IsString({ message: 'first name should be a string value.' })
  @MinLength(3, {
    message: 'first name should have a minimum of 3 characteres.',
  })
  @MaxLength(20, {
    message: 'first name should have a maximum of 20 characteres.',
  })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'last name should be a string value.' })
  @MinLength(3, {
    message: 'last name should have a minimum of 3 characteres.',
  })
  @MaxLength(30, {
    message: 'last name should have a maximum of 30 characteres.',
  })
  lastName?: string;

  @IsOptional()
  @MaxLength(20, {
    message: 'gender should have a maximum of 20 characteres.',
  })
  @IsEnum(Gender, {
    message: 'gender must be either male, female, or orther',
  })
  gender?: Gender;

  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
