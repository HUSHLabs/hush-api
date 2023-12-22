import {Injectable, Logger} from "@nestjs/common";
import {PrismaDecimal, PrismaService} from './prisma.service';

export type VerificationResponse = {
    id: string,
    threshold: PrismaDecimal,
    contractAddress: string,
    statement: string,
    clientName: string,
    clientLogo: string
}

@Injectable()
export class VerificationService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async getVerifications(): Promise<VerificationResponse[]> {
        const verifications = await this.prismaService.verification.findMany({
            orderBy: [
                {
                    threshold: 'asc',
                },
            ],
            include: {
                client: true
            }
        });
        return verifications.map(verification => {
            return {
                id: verification.id,
                threshold: verification.threshold,
                contractAddress: verification.contractAddress,
                statement: verification.statement,
                clientName: verification.client.name,
                clientLogo: verification.client.logoUrl
            }
        });
    }

    // TODO: Implement guard for this route
    async getVerificationById(id: string): Promise<VerificationResponse> {
        const verification = await this.prismaService.verification.findUnique({
            where: {
                id: id
            },
            include: {
                client: true
            }
        });

        Logger.log(`Returning verification with id ${id} verification: ${JSON.stringify(verification)}`);

        return {
            id: verification.id,
            threshold: verification.threshold,
            contractAddress: verification.contractAddress,
            statement: verification.statement,
            clientName: verification.client.name,
            clientLogo: verification.client.logoUrl
        }
    }
}