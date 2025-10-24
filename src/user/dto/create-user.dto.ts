import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Valid user email address',
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'eemail should have a maximum of 100 characteres.',
  })
  email: string;

  @ApiProperty({
    example: 'jhon123',
    description: 'Unique username',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, {
    message: 'username should have a maximum of 20 characteres.',
  })
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Password between 8 and 16 characters, containing at least one uppercase letter, one lowercase letter, one number, and one symbol',
    minLength: 8,
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,16}$/,
    {
      message:
        'A senha deve ter entre 8 e 16 caracteres e conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Profile associated with the user',
    required: false,
    type: () => CreateProfileDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}
