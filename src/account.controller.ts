import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/getAccountsForProof/:verificationId/:accountsNumber')
  async getAccountsForProof(
    @Param('verificationId') verificationId: string,
    @Param('accountsNumber') accountsNumber: number,
  ) {
    return await this.accountService.getAccountsForProof(
      verificationId,
      Number(accountsNumber),
    );
  }
}
