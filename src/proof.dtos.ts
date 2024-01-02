import { Decimal } from "@prisma/client/runtime/library";

export type IProof = {
  addresses: string[];
  proof: string;
  publicInput: string;
  statement: string;
  blockNumber: number;
  threshold: number;
};

export type ProofCreateRequest = IProof & {
  verificationId: string;
  blockNumber: number;
};
