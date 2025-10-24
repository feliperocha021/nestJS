import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../profile.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiPropertyOptional({
    example: 'Jhon',
    description: 'First name of the user',
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'first name should be a string value.' })
  @MinLength(3, {
    message: 'first name should have a minimum of 3 characteres.',
  })
  @MaxLength(20, {
    message: 'first name should have a maximum of 20 characteres.',
  })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Smith',
    description: 'Last name of the user',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'last name should be a string value.' })
  @MinLength(3, {
    message: 'last name should have a minimum of 3 characteres.',
  })
  @MaxLength(30, {
    message: 'last name should have a maximum of 30 characteres.',
  })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'User gender (male, female ou other)',
    enum: Gender,
  })
  @IsOptional()
  @MaxLength(20, {
    message: 'gender should have a maximum of 20 characteres.',
  })
  @IsEnum(Gender, {
    message: 'gender must be either male, female, or orther',
  })
  gender?: Gender;

  @ApiPropertyOptional({
    example: '1995-05-20',
    description: 'date of birth of the user',
    type: Date,
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: 'A cool guy',
    description: 'user biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://meu-bucket-s3.s3.amazonaws.com/profiles/image.png',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
