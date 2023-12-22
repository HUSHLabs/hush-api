import { Controller, Get, Logger, Param } from "@nestjs/common";
import { VerificationService } from "./verification.service";

@Controller()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get("/verification/:id")
    async getVerificationById(@Param("id")id: string) {
        Logger.log(`Received request for verification with id ${id}`);
        return this.verificationService.getVerificationById(id);
    }
}