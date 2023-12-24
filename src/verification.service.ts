import { Injectable, Logger } from '@nestjs/common';
import { PrismaDecimal, PrismaService } from './prisma.service';

export type VerificationResponse = {
  id: string;
  threshold: PrismaDecimal;
  contractAddress: string;
  statement: string;
  clientName: string;
  clientLogo: string;
  slug: string;
};

@Injectable()
export class VerificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getVerifications(): Promise<VerificationResponse[]> {
    const verifications = await this.prismaService.verification.findMany({
      orderBy: [
        {
          threshold: 'asc',
        },
      ],
      include: {
        client: true,
      },
    });
    return verifications.map((verification) => {
      return {
        id: verification.id,
        slug: verification.slug,
        threshold: verification.threshold,
        contractAddress: verification.contractAddress,
        statement: verification.statement,
        clientName: verification.client.name,
        clientLogo: verification.client.logoUrl,
      };
    });
  }

  // TODO: Implement guard for this route
  async getVerificationBySlug(slug: string): Promise<VerificationResponse> {
    const verification = await this.prismaService.verification.findFirst({
      where: {
        slug: slug,
      },
      include: {
        client: true,
      },
    });

    Logger.log(
      `Returning verification with id ${slug} verification: ${JSON.stringify(
        verification,
      )}`,
    );

    return {
      id: verification.id,
      slug: verification.slug,
      threshold: verification.threshold,
      contractAddress: verification.contractAddress,
      statement: verification.statement,
      clientName: verification.client.name,
      clientLogo: verification.client.logoUrl,
    };
  }
}
