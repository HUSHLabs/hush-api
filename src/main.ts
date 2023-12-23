import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  if(environment.vercelEnvPort) {
    await app.listen(Number(environment.vercelEnvPort));
  } else {
    await app.listen(4000);
  }
}
bootstrap();
