import { Injectable } from "@nestjs/common";
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

        return verification;
    }
}