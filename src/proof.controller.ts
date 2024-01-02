import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ProofService } from './proof.service';
import { IProof, ProofCreateRequest } from './proof.dtos';
import { Proof } from '@prisma/client/';
import { VerificationService } from './verification.service';

@Controller()
export class ProofController {
  constructor(
    private readonly proofService: ProofService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('/createProof')
  async createProof(@Body() body: ProofCreateRequest): Promise<Proof | Error> {
    const verification = await this.verificationService.getVerificationById(
      body.verificationId,
    );

    if (!verification) {
      return Error('Invalid verification');
    }

    const proof: IProof = {
      addresses: body.addresses,
      proof: body.proof,
      publicInput: body.publicInput,
      statement: body.statement,
      threshold: Number(verification.threshold),
      blockNumber: body.blockNumber,
    };

    Logger.log('Testing proof');
    // Logger.log(proof);

    const isValidProof = await this.proofService.verifyHushProof(proof);
    if (!isValidProof) {
      return Error('Invalid proof');
    }

    Logger.log('Creating proof');

    return await this.proofService.create(
      proof,
      body.verificationId,
      body.blockNumber,
    );
  }
}
