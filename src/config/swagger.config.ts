import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API - Twitter Clone')
  .setDescription('API Documentation (Auth, Users, Tweets, Profiles, Hashtags)')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Insira o token JWT aqui',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();
