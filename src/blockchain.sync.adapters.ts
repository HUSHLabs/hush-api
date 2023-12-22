import { PrismaService } from "./prisma.service"
import { Erc20Abi } from "artifacts"
import { TransferEvent, TransferEventObject } from "artifacts/Erc20Abi"
import { tuple } from "./utils"
import { ContractSyncAdapter, SyncAdapterSubscriptionHandler } from "./base.blockchain.sync.service"
import { Logger } from "@nestjs/common"
import { from } from "rxjs"
import { environment } from "./env"

export class ERC20RecordSyncAdapter implements ContractSyncAdapter<TransferEvent, string> {
    entityName = "erc20Record"

    constructor(readonly contract: Erc20Abi, private readonly prismaService: PrismaService) {
    }

    async queryFilter(fromBlock: number, toBlock: number) {
        const events = await this.contract.queryFilter(this.contract.filters.Transfer(), fromBlock, toBlock)
        return events.map((event) => tuple(event, event))
    }

    onEvent(handler: SyncAdapterSubscriptionHandler<TransferEvent>): void {
        // Subscribe to the Transfer event of USDT contract using RPC url in environment

        Logger.log("Subscribing to Transfer events")
        this.contract.on("Transfer(address,address,uint256)", handler)
        this.contract.on("Transfer(address,address,uint256)", (event) => {
            Logger.log("Received Transfer event", event)
        })
    }

    async persist(event: TransferEvent): Promise<string | null> { 
        // console.log("Persisting Transfer event", event)
        const { from, to, value } = event.args
        const args: TransferEventObject = { from, to, value }
        // extract from args the fields we want to persist
        const blockNumber = event.blockNumber
        Logger.log("Persisting Transfer event", args, typeof args)  
        // convert event to a record
        await this.prismaService.account.upsert({
            where: {
                address: args.from,
                contractAddress: this.contract.address
            },
            create: {
                address: args.from,
                balance: args.value.toString(), // Convert BigNumber to string
                contractAddress: this.contract.address, 
                blockNumber: event.blockNumber
            },
            update: {
                balance: args.value.toString(),
                blockNumber: blockNumber
            }
        })

        return args.from
    }

    async clearPersistence(exceptIds: string[]): Promise<void> {
        // await this.prismaClient.accessLedgerRecord.deleteMany({ where: { id: { notIn: exceptIds } } })
    }

    async statefulUpdate(): Promise<TransferEvent[]> {
        return []
    }
}
