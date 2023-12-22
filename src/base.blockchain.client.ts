import { BaseProvider, JsonRpcProvider } from "@ethersproject/providers"
import { Erc20Abi, Erc20Abi__factory } from "artifacts"
import { WebsocketClient } from "./websocket.client"
import { EventEmitter } from "stream"
import { Signer } from "ethers"
import { Logger } from "@nestjs/common"
import { environment } from "./env"

const nodeUrl = environment.blockchainNodeAddress.value
const USDT_CONTRACT_ADDRESS = environment.usdtContractAddress.value

export class BaseBlockchainClient {
    private emitter: EventEmitter = new EventEmitter()
    private initializedAtLeastOnce = false

    provider: BaseProvider | null = null
    usdt: Erc20Abi | null = null

    constructor() {
        if (!nodeUrl) {
            console.log("WARNING: BLOCKCHAIN_NODE_URL not set, blockchain operations will be mocked")
        } else {
            let providerFactory: () => JsonRpcProvider
            let websocketManager: WebsocketClient | null = null
            if (nodeUrl.startsWith("ws")) {
                console.log("Using websocket provider")
                const _websocketManager = new WebsocketClient(nodeUrl)
                websocketManager = _websocketManager
                providerFactory = () => _websocketManager.provider
            } else {
                console.log("Using http provider")
                providerFactory = () => new JsonRpcProvider(nodeUrl)
            }

        
            Logger.log("Initializing BlockchainClient")
            Logger.log("Connecting to " + nodeUrl)
            Logger.log("USDT_CONTRACT_ADDRESS: " + USDT_CONTRACT_ADDRESS)

            const initalize = () => {
                const provider = providerFactory()
                this.provider = provider
                const providerOrSigner = this.createSigner(provider) ?? provider
    
                this.usdt = Erc20Abi__factory.connect(USDT_CONTRACT_ADDRESS, providerOrSigner)
                Logger.log("BlockchainClient initialized")
            }

            if (websocketManager) {
                websocketManager?.onConnected(initalize)
            } else {
                initalize()
            }
        }
    }

    onContractsIntialized(callback: () => void) {
        this.emitter.on("initialized", callback)
        if (this.initializedAtLeastOnce) {
            callback()
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createSigner(provider: BaseProvider): Signer | null {
        return null
    }
}