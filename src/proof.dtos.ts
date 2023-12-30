export type IProof = {
  addresses: string[];
  circuitPubInput: {
    Tx: string;
    Ty: string;
    Ux: string;
    Uy: string;
    merkleRoot: string;
  };
  msgHash: string;
  proof: string;
  r: string;
  rV: string;
  statement: string;
  blockNumber: number;
  threshold: number;
};

export type ProofCreateRequest = IProof & {
  verificationId: string;
  blockNumber: number;
};
