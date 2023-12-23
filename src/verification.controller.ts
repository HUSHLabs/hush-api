import { Controller, Get, Logger, Param } from "@nestjs/common";
import { VerificationService, VerificationResponse } from "./verification.service";

@Controller()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get("/verification/:slug")
    async getVerificationById(@Param("slug")slug: string): Promise<VerificationResponse> {
        Logger.log(`Received request for verification with slug ${slug}`);
        return this.verificationService.getVerificationBySlug(slug);
    }
    @Get("/verifications")
    async getVerifications(): Promise<VerificationResponse[]> {

        return this.verificationService.getVerifications();
    }
}