import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { swaggerConfig } from './config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
//import { SpelunkerModule } from 'nestjs-spelunker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Prefixo e versionamento
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    origin: ['http://localhost:8080'], // quem pode acessar
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // permite cookies/headers de autenticação
  });

  // http://localhost:3000/docs para acessar o Swagger
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true }, // mantém o token JWT após recarregar
    });
  }

  await app.listen(process.env.APP_PORT ?? 3000);
  //console.log(SpelunkerModule.explore(app));
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
