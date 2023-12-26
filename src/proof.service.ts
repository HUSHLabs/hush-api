import { IProof } from './proof.dtos';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Proof } from '@prisma/client/';
import { UuidFactory } from '@nestjs/core/inspector/uuid-factory';

@Injectable()
export class ProofService {
  constructor(private readonly prismaService: PrismaService) {}

  async toProofDto(
    proof: IProof,
    verificationId: string,
    blockNumber: number,
  ): Promise<Proof> {
    return {
      blockNumber,
      id: UuidFactory.get(proof.proof),
      ...proof,
      verificationId: verificationId,
    };
  }

  async create(
    proof: IProof,
    verificationId: string,
    blockNumber: number,
  ): Promise<Proof> {
    console.log('proof', proof);
    console.log('verificationId', verificationId);
    console.log('blockNumber', blockNumber);

    return this.prismaService.proof.create({
      data: await this.toProofDto(proof, verificationId, blockNumber),
    });
  }
}
