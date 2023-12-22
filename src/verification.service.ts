import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from './prisma.service';
import { Verification } from "@prisma/client";

@Injectable()
export class VerificationService {
    constructor(private readonly prismaService: PrismaService) {}

    // TODO: Implement guard for this route
    async getVerificationById(id: string): Promise<Verification> {
        const verification = await this.prismaService.verification.findUnique({
            where: {
                id: id
            }, 
            include: {
                client: true
            }
        });

        Logger.log(`Returning verification with id ${id} verification: ${JSON.stringify(verification)}`);
        return verification;
    }
}