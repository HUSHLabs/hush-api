import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(Number(environment.port));
}
bootstrap();
