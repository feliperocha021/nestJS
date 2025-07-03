import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  id: number;

  @IsString({ message: 'name should be a string value.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'name should have a minimum of 3 characteres.' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  isMarried: boolean;
}
