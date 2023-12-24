import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BlockchainSyncState } from '@prisma/client';
import { BaseBlockchainSyncService } from './base.blockchain.sync.service';
import { ERC20RecordSyncAdapter } from './blockchain.sync.adapters';
import { EventEmitter } from 'stream';
import { environment } from './env';
import { BaseBlockchainClient } from './base.blockchain.client';

@Injectable()
export class BlockchainSyncService extends BaseBlockchainSyncService {
  start() {
    throw new Error('Method not implemented.');
  }
  private emitter: EventEmitter = new EventEmitter();
  private initializedAtLeastOnce = false;

  constructor(
    private readonly blockchainClient: BaseBlockchainClient,
    private readonly prismaService: PrismaService,
  ) {
    Logger.log('BlockchainSyncService constructor');
    super(blockchainClient);
  }

  protected async run() {
    await super.run();

    Logger.log('BlockchainSyncService run');
    if (this.blockchainClient.usdt) {
      await this.startSync(
        new ERC20RecordSyncAdapter(
          this.blockchainClient.usdt,
          this.prismaService,
        ),
        this.blockchainClient.provider._lastBlockNumber,
      );
      Logger.log(
        'Started USDT sync at block ' +
          this.blockchainClient.provider._lastBlockNumber,
      );
    }

    this.initializedAtLeastOnce = true;
    this.emitter.emit('initialized');
  }

  onSyncInitialized(callback: () => void) {
    this.emitter.on('initialized', callback);
    if (this.initializedAtLeastOnce) {
      callback();
    }
  }

  protected async getBlockchainSyncState(
    entity: string,
  ): Promise<BlockchainSyncState | null> {
    return await this.prismaService.blockchainSyncState.findFirst({
      where: { entity },
    });
  }

  protected async updateBlockchainSyncState(
    syncState: BlockchainSyncState,
  ): Promise<void> {
    await this.prismaService.blockchainSyncState.upsert({
      where: { entity: syncState.entity },
      create: syncState,
      update: syncState,
    });
  }
}
