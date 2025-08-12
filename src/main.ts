import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SpelunkerModule } from 'nestjs-spelunker';

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
  await app.listen(process.env.APP_PORT ?? 3000);
  //console.log(SpelunkerModule.explore(app));
}
bootstrap().catch((err) => {
  console.error('Erro ao iniciar a aplicação:', err);
});
