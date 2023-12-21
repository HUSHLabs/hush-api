import { Controller, Get, Param } from "@nestjs/common";
import { VerificationService } from "./verification.service";

@Controller()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get("/verification/:id")
    async getVerificationById(@Param("id")id: string) {
        return this.verificationService.getVerificationById(id);
    }
}