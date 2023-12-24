import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAccountsForProof(verificationId: string, accountsNumber: number) {
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
      },
      take: accountsNumber,
    });

    return accounts.map((account) => account.address);
  }
}
