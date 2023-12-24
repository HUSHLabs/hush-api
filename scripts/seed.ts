import { PrismaService } from '../src/prisma.service';

const prisma = new PrismaService();
async function main() {
  await prisma.verification.create({
    data: {
      id: '893a7765-773d-4b65-aebf-9f9c9644d5a2',
      threshold: 100000,
      contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      callbackUrls: ['https://0xbin.xyz/verification/callback'],
      statement:
        'I hereby state that i own account with more than 100k USDT at ethereum mainnet for purpose of onboarding to 0xbin at blocknumber 18842308.',
      slug: '100k-club',
      client: {
        create: {
          id: 'cd79241b-f335-4462-9f4a-0424aa0e77f5',
          name: '0xbin',
          email: 'person@0xbin.xyz',
          logoUrl: 'https://0xbin.xyz/logo.png',
          clientSecret: '0xfefefefefefefefefefefe',
        },
      },
    },
  });
}

main().then(() => {
  console.log('Seeding complete');
  process.exit(0);
});
