import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'jhon',
    description: 'username for login',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'password user',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
