import * as dotenv from "dotenv"

dotenv.config()

export class EnvironmentValue {
    value: string | undefined

    constructor(private envKey: string) {
        this.value = process.env[envKey]
    }

    require() {
        if (!this.value) {
            throw new Error(`${this.envKey} not set!`)
        }
        return this.value
    }
}

export const environment = {
    maxEventLookbackBlocks: new EnvironmentValue("MAX_EVENT_LOOKBACK_BLOCKS"),
    blockchainNodeAddress: new EnvironmentValue("BLOCKCHAIN_NODE_ADDRESS"),
    usdtContractAddress: new EnvironmentValue("USDT_CONTRACT_ADDRESS"),
    websocketNodeAddress: new EnvironmentValue("WEBSOCKET_NODE_ADDRESS"),
    // operationalPrivateKey: new EnvironmentValue("OPERATIONAL_PRIVATE_KEY"),
    startSyncBlock: new EnvironmentValue("START_SYNC_BLOCK"),
    port: new EnvironmentValue("PORT"),
}