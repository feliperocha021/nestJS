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
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+\\|;:'",.<>/?]).{8,16}$/,
    {
      message:
        'A senha deve ter entre 8 e 16 caracteres e conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
    },
  )
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}
