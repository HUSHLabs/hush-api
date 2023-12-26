import { Body, Controller, Post, Req } from "@nestjs/common";
import { ProofService } from './proof.service';
import { IProof } from './proof.dtos';

@Controller()
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @Post('/createProof')
  async createProof(@Body() body) {
    const proof: IProof = {
      addresses: body.addresses,
      circuitPubInput: body.circuitPubInput,
      msgHash: body.msgHash,
      proof: body.proof,
      r: body.r,
      rV: body.rV,
      statement: body.statement,
    };
    return await this.proofService.create(
      proof,
      body.verificationId,
      body.blockNumber,
    );
  }
}
