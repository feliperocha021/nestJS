import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenPayloadDto {
  @IsNotEmpty()
  @IsString()
  sub: string; // userId

  @IsNotEmpty()
  @IsString()
  jti: string; // token identifier
}
