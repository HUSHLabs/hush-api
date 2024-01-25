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
  description: string;
  shortDescription: string;
  imageUrl: string;
  name: string;
};

@Injectable()
export class VerificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async getVerifications(clientName: string): Promise<VerificationResponse[]> {
    const verifications = await this.prismaService.verification.findMany({
      orderBy: [
        {
          threshold: 'asc',
        },
      ],
      where: {
        client: {
          name: clientName,
        },
      },
      include: {
        client: true,
      },
    });
    console.log(verifications);
    return verifications.map((verification) => {
      return {
        id: verification.id,
        slug: verification.slug,
        threshold: verification.threshold,
        contractAddress: verification.contractAddress,
        statement: verification.statement,
        clientName: verification.client.name,
        clientLogo: verification.client.logoUrl,
        description: verification.description,
        shortDescription: verification.shortDescription,
        imageUrl: verification.imageUrl,
        name: verification.name,
      };
    });
  }

  // TODO: Implement guard for this route
  async getVerificationBySlug(
    client: string,
    slug: string,
  ): Promise<VerificationResponse> {
    const verification = await this.prismaService.verification.findFirst({
      where: {
        slug: slug,
        client: {
          name: client,
        },
      },
      include: {
        client: true,
      },
    });

    Logger.log(
      `Returning verification with slug ${slug} verification: ${JSON.stringify(
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
      description: verification.description,
      shortDescription: verification.shortDescription,
      imageUrl: verification.imageUrl,
      name: verification.name,
    };
  }

  async getVerificationById(id: string): Promise<VerificationResponse> {
    const verification = await this.prismaService.verification.findUnique({
      where: {
        id: id,
      },
      include: {
        client: true,
      },
    });

    Logger.log(
      `Returning verification with id ${id} verification: ${JSON.stringify(
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
      description: verification.description,
      shortDescription: verification.shortDescription,
      imageUrl: verification.imageUrl,
      name: verification.name,
    };
  }
}
