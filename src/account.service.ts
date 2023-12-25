import { bigNumberToDecimal, PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseBlockchainClient } from './base.blockchain.client';
import { BigNumber, ethers } from 'ethers';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockchainClient: BaseBlockchainClient,
  ) {}

  async getAccountsForProof(
    verificationId: string,
    accountsNumber: number,
    blockNumber: number,
  ) {
    const verification = await this.prismaService.verification.findUnique({
      where: {
        id: verificationId,
      },
    });

    const accounts = await this.prismaService.account.findMany({
      where: {
        balance: {
          gt: verification.threshold,
        },
        blockNumber: {
          lte: blockNumber,
        },
      },
      take: accountsNumber,
    });

    // check all accounts have enough balance at that blocknumber
    const accountsWithEnoughBalance = await Promise.all(
      // call blockchain client to check balance
      accounts.map(async (account) => {
        const balance = await this.blockchainClient.usdt.balanceOf(
          account.address,
          {
            blockTag: blockNumber, // this defines the block number to use
          },
        );

        if (
          // 6 decimals for USDT - TODO: make this dynamic and based on ERC20 contract decimals
          new Decimal(ethers.utils.formatUnits(balance, 6)) <
          verification.threshold
        ) {
          return null;
        } else {
          return account;
        }
      }),
    );

    console.log('accountsWithEnoughBalance', accountsWithEnoughBalance);

    // weed out null accounts and return addresses
    return accountsWithEnoughBalance
      .filter((account) => account !== null)
      .map((account) => {
        return account.address;
      });
  }
}
