import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BigNumber } from 'ethers';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

export type PrismaDecimal = Decimal;

export function decimalToBigInt(decimal: Decimal) {
  // decimal.toString() uses exponential notation, e.g. '8.771038879113004e+76' which fails
  // toFixed() bypasses this, verified by looking at decimal.js source code
  return BigInt(decimal.toFixed(0));
}

export function bigIntToDecimal(bigInt: bigint) {
  return new Decimal(bigInt.toString());
}

// write function to convert from BigNumber to Decimal
export function bigNumberToDecimal(bigNumber: BigNumber) {
  return new Decimal(bigNumber.toString());
}
