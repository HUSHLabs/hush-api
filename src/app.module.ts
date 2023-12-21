import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [
    AppController, 
    VerificationController
  ],
  providers: [
    AppService, 
    PrismaService,
    VerificationService
  ],
})
export class AppModule {}
