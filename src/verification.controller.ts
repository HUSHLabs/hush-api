import { Controller, Get, Logger, Param } from "@nestjs/common";
import { VerificationService, VerificationResponse } from "./verification.service";

@Controller()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get("/verification/:id")
    async getVerificationById(@Param("id")id: string): Promise<VerificationResponse> {
        Logger.log(`Received request for verification with id ${id}`);
        return this.verificationService.getVerificationById(id);
    }
}