import { BaseProvider } from "@ethersproject/providers"
import { Injectable } from "@nestjs/common"
import { Signer, ethers } from "ethers"
import { BaseBlockchainClient } from "./base.blockchain.client"
import { environment } from "./env"

const operationAccountPrivateKey = environment.operationalPrivateKey.require()

@Injectable()
export class BlockchainClient extends BaseBlockchainClient {
    createSigner(provider: BaseProvider): Signer | null {
        return new ethers.Wallet(operationAccountPrivateKey, provider)
    }
}
