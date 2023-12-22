import { PrismaService, bigIntToDecimal, bigNumberToDecimal } from "./prisma.service"
import { Erc20Abi } from "artifacts"
import { TransferEventObject } from "artifacts/Erc20Abi"
import { tuple } from "./utils"
import { ContractSyncAdapter, SyncAdapterSubscriptionHandler } from "./base.blockchain.sync.service"
import { Logger } from "@nestjs/common"
import { BaseBlockchainClient } from "./base.blockchain.client"

export class ERC20RecordSyncAdapter implements ContractSyncAdapter<TransferEventObject, string> {
    entityName = "erc20Record"

    constructor(
        readonly contract: Erc20Abi, 
        private readonly prismaService: PrismaService,
    ) {}

    async queryFilter(fromBlock: number, toBlock: number) {
        const events = await this.contract.queryFilter(this.contract.filters.Transfer(), fromBlock, toBlock)
        return events.map((event) => tuple(event.args, event))
    }

    onEvent(handler: SyncAdapterSubscriptionHandler<TransferEventObject>): void {
        // Subscribe to the Transfer event of USDT contract using RPC url in environment
        Logger.log("Subscribing to Transfer events")
        this.contract.on(this.contract.filters.Transfer(), (from, to,value, log) => {
            handler({
                 from: from,
                to: to,
                value: value,
            }, log);
        })
    }

    async persist(event: TransferEventObject, blockNumber: number): Promise<string | null> { 
        console.log("Persisting Transfer event", JSON.stringify(await event))
        console.log("Persisting Transfer event", event)
        const { from, to, value } = event
        // extract from args the fields we want to persist
        Logger.log("Persisting Transfer event",  { from, to, value })  
        // convert event to a record

        // Update from account state
        await this.prismaService.account.upsert({
            where: {
                address: from,
                contractAddress: this.contract.address
            },
            create: {
                address: from,
                balance: bigNumberToDecimal(await this.contract.balanceOf(from)),
                contractAddress: this.contract.address, 
                blockNumber: blockNumber
            },
            update: {
                balance: bigNumberToDecimal(await this.contract.balanceOf(from)),
                blockNumber: blockNumber
            }
        })

        await this.prismaService.account.upsert({
            where: {
                address: to,
                contractAddress: this.contract.address
            },
            create: {
                address: to,
                balance: bigNumberToDecimal(await this.contract.balanceOf(to)),
                contractAddress: this.contract.address, 
                blockNumber: blockNumber
            },
            update: {
                balance: bigNumberToDecimal(await this.contract.balanceOf(to)),
                blockNumber: blockNumber
            }
        })

        return from
    }

    async clearPersistence(exceptIds: string[]): Promise<void> {
        // await this.prismaClient.accessLedgerRecord.deleteMany({ where: { id: { notIn: exceptIds } } })
    }

    async statefulUpdate(): Promise<TransferEventObject[]> {
        return []
    }
}
