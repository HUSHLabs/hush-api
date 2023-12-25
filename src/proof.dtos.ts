export interface IProof {
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
}
