import { IProof } from './proof.dtos';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Proof } from '@prisma/client/';
import { UuidFactory } from '@nestjs/core/inspector/uuid-factory';
import {
  ProverConfig,
  VerifyConfig,
  MembershipVerifier,
} from '@personaelabs/spartan-ecdsa';
import { ethers } from 'ethers';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseBlockchainClient } from './base.blockchain.client';
import { BlockTag } from '@ethersproject/providers';

type VerificationInput = {
  proof: Uint8Array;
  publicInput: Uint8Array;
};

const hushProofProverConfigDefault: ProverConfig = {
  witnessGenWasm: 'src/artifacts/addr_membership.wasm',
  circuit: 'src/artifacts/addr_membership.circuit',
};

const hushProofVerifierConfigDefault: VerifyConfig = {
  circuit: hushProofProverConfigDefault.circuit,
};

@Injectable()
export class ProofService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockchainClient: BaseBlockchainClient,
  ) {}

  async toProofDto(
    proof: IProof,
    verificationId: string,
    blockNumber: number,
  ): Promise<Proof> {
    return {
      addresses: proof.addresses,
      proof: proof.proof,
      statement: proof.statement,
      publicInput: proof.publicInput,
      blockNumber,
      threshold: new Decimal(proof.threshold),
      id: UuidFactory.get(proof.proof),
      verificationId: verificationId
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

  async verifyZkProof(proof: VerificationInput): Promise<boolean> {
    Logger.log('Verifying proof');
    const verifier: MembershipVerifier = new MembershipVerifier(
      hushProofVerifierConfigDefault,
    );

    Logger.log('Initializing wasm');
    await verifier.initWasm();

    Logger.log('Verifying proof from wasm');

    const verified = await verifier.verify(proof.proof, proof.publicInput);

    Logger.log('Verified proof', verified);
    return verified;
  }

  async verifyHushProof(proof: IProof): Promise<boolean> {
    const verifiedAddresses = await this.verifyAddresses(
      proof.addresses,
      proof.blockNumber,
      new Decimal(proof.threshold),
    );

    const verifiedZkProof = await this.verifyZkProof({
      proof: ethers.utils.arrayify(proof.proof),
      publicInput: ethers.utils.arrayify(proof.publicInput),
    });

    return verifiedZkProof && verifiedAddresses;
  }

  async verifyAddresses(
    accounts: string[],
    blockNumber: string | number | Promise<BlockTag>,
    threshold: Decimal,
  ): Promise<boolean> {
    await Promise.all(
      // call blockchain client to check balance
      accounts.map(async (account) => {
        const balance = await this.blockchainClient.usdt.balanceOf(account, {
          blockTag: blockNumber, // this defines the block number to use
        });

        if (
          // 6 decimals for USDT - TODO: make this dynamic and based on ERC20 contract decimals
          new Decimal(ethers.utils.formatUnits(balance, 6)) < threshold
        ) {
          console.log(
            `Account ${account} does not have enough balance at block number ${blockNumber}`,
          );
          //return false;
        }
      }),
    );

    return true;
  }
}
