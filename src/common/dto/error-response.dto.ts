import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: ['Invalid input data'],
    description: 'Mensagem ou lista de mensagens de erro',
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error?: string;

  @ApiProperty({ example: '2025-10-23T17:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/users' })
  path: string;
}
