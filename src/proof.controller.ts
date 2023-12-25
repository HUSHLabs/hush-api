import { Controller, Post } from '@nestjs/common';
import { ProofService } from './proof.service';
import { IProof, ProofCreateRequest } from './proof.dtos';

@Controller()
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @Post()
  async createProof(body: ProofCreateRequest) {
    return await this.proofService.create(
      body as IProof,
      body.verificationId,
      body.blockNumber,
    );
  }
}
