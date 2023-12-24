import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { PrismaService } from './prisma.service';
import { BlockchainSyncService } from './blockchain.sync.service';
import { BaseBlockchainClient } from './base.blockchain.client';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
  imports: [],
  controllers: [AppController, VerificationController, AccountController],
  providers: [
    AppService,
    PrismaService,
    BaseBlockchainClient,
    BlockchainSyncService,
    VerificationService,
    AccountService,
  ],
})
export class AppModule {}
