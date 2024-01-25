import { Controller, Get, Logger, Param } from '@nestjs/common';
import {
  VerificationService,
  VerificationResponse,
} from './verification.service';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('/verification/:client/:slug')
  async getVerificationBySlug(
    @Param('client') client: string,
    @Param('slug') slug: string,
  ): Promise<VerificationResponse> {
    Logger.log(`Received request for verification with slug ${slug}`);
    return this.verificationService.getVerificationBySlug(client, slug);
  }
  @Get('/verifications/:clientName')
  async getVerifications(@Param('clientName') clientName: string): Promise<VerificationResponse[]> {
    return this.verificationService.getVerifications(clientName);
  }
}
