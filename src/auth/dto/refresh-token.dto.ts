import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your-refresh-token',
    description: 'Refresh token storaged in httpOnly cookies',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
