import { Log, Provider, WebSocketProvider } from "@ethersproject/providers"
import { BaseContract } from "ethers"
import { BehaviorSubject } from "rxjs"
import { BaseBlockchainClient } from "./base.blockchain.client"
import { environment } from "./env"
import pLimit from "p-limit"
import { BlockchainClient } from "./blockchain.client"

export interface ContractSyncAdapter<EventType, IdType> {
    clearPersistenceBeforeResync?: boolean
    contract: BaseContract
    entityName: string
    queryFilter(fromBlock: number, toBlock: number): Promise<Array<[EventType, Log]>>
    /// Important: handler must be called synchronously with event delivery, otherwise block sync may not work
    onEvent(handler: SyncAdapterSubscriptionHandler<EventType>): void
    persist(event: EventType): Promise<IdType | null>
    clearPersistence(exceptIds: IdType[]): Promise<void>
    statefulUpdate(): Promise<EventType[]>
}

export type BlockchainSyncState = {
    entity: string
    earliestBlockHash: string
    contractAddress: string
    lastSeenBlockNumber: number
}

export type SyncAdapterSubscriptionHandler<Event> = (eventContents: Event | Promise<Event>, event: Log) => void

const maxEventLookbackBlocks = environment.maxEventLookbackBlocks.value
    ? parseInt(environment.maxEventLookbackBlocks.value)
    : Number.MAX_VALUE

export abstract class BaseBlockchainSyncService {
    lastProcessedBlockNumber: BehaviorSubject<number> = new BehaviorSubject(0)

    private pendingProcessing: Array<Promise<void>> = []

    constructor(private readonly baseBlockchainClient: BaseBlockchainClient) {
        // this.baseBlockchainClient.onContractsIntialized(() => this.run())
        this.run()
    }

    protected async run() {
        if (!this.baseBlockchainClient.provider) return

        this.trackBlockNumber(this.baseBlockchainClient.provider)
    }

    protected abstract getBlockchainSyncState(entity: string): Promise<BlockchainSyncState | null>
    protected abstract updateBlockchainSyncState(syncState: BlockchainSyncState): Promise<void>

    /**
     * This method should be able to be used with any object that is stored on the blockchain in a contract, assuming
     * you implement the appropriate adapter.
     *
     * To work, it requires that the contracts emits an event containing the object whenever that object is created
     * or modified, but also has a way to query contract state in case events are not available to get the initial state.
     */

    protected async startSync<EventType, IdType>(adapter: ContractSyncAdapter<EventType, IdType>, deployedBlockNumber: number) {
        console.log(`Syncing: ${adapter.entityName}`)
        const initialBlockchainSyncState = await this.getBlockchainSyncState(adapter.entityName)

        const earliestBlockHash = (await adapter.contract.provider.getBlock("earliest")).hash
        const contractAddress = adapter.contract.address
        const currentBlockNumber = (await adapter.contract.provider.getBlock("latest")).number

        let blockchainSyncState: BlockchainSyncState
        // We're dealing with either a first run, a different blockchain or a different
        // contract, therefore everything that's existing is invalid. Blow it all away and
        // start from scratch
        let deleteExisting: boolean
        if (
            !initialBlockchainSyncState ||
            earliestBlockHash !== initialBlockchainSyncState.earliestBlockHash ||
            contractAddress !== initialBlockchainSyncState.contractAddress
        ) {
            console.log(`Blockchain or contract address change: ${adapter.entityName}`)
            if (adapter.clearPersistenceBeforeResync) {
                await adapter.clearPersistence([])
                deleteExisting = false
            } else {
                deleteExisting = true
            }

            // We don't need to scan back further than when the contract was deployed
            blockchainSyncState = {
                entity: adapter.entityName,
                earliestBlockHash,
                contractAddress,
                lastSeenBlockNumber: deployedBlockNumber - 1,
            }
        } else {
            deleteExisting = false
            blockchainSyncState = initialBlockchainSyncState
        }

        // Catch up on anything we missed while the service was down
        // This includes loading initial state on first run
        const persistedIds = []
        if (currentBlockNumber !== blockchainSyncState.lastSeenBlockNumber) {
            console.log("Performing log-based catch up...")

            const startingBlockNumber = (blockchainSyncState.lastSeenBlockNumber ?? -1) + 1
            const blockRange = currentBlockNumber - startingBlockNumber + 1 // plus one because this is an inclusive range
            const numberOfLogRequests = Math.ceil(blockRange / maxEventLookbackBlocks)
            if (numberOfLogRequests > 1) {
                console.log("Need to make multiple requests for logs")
            }

            const missedEvents: Array<[EventType, Log]> = []
            for (let i = 0; i < numberOfLogRequests; i++) {
                const start = startingBlockNumber + maxEventLookbackBlocks * i
                // Since queryFilter is inclusive on both ends, fetching up to start + maxEventLookbackBlocks will actually fetch
                // maxEventLookbackBlocks + 1 blocks, which not what we want, so we need to subtract 1.
                const end = Math.min(start + maxEventLookbackBlocks - 1, currentBlockNumber)
                console.log(`Query blocks for logs: ${start} to ${end}`)
                missedEvents.push(...(await adapter.queryFilter(start, end)))
            }
            console.log("Done querying for logs")
            const orderedEvents = missedEvents.sort(([_1, event1], [_2, event2]) => this.compareEvents(event1, event2))
            for (const [eventObject, _event] of orderedEvents) {
                console.log(`Catch Up:  ${adapter.entityName}`)
                const id = await adapter.persist(eventObject)
                if (id) persistedIds.push(id)
            }
        }

        // If this is a total resync, we need to clear out anything that wasn't just synced
        if (deleteExisting) {
            await adapter.clearPersistence(persistedIds)
        }

        // Update sync state post-catchup
        blockchainSyncState = { entity: adapter.entityName, earliestBlockHash, contractAddress, lastSeenBlockNumber: currentBlockNumber }
        await this.updateBlockchainSyncState(blockchainSyncState)

        // Subscribe to new events
        const serialize = pLimit(1)
        adapter.onEvent((eventContents, event) => {
            const pendingProcessing = serialize(async () => {
                console.log(`Received Event: ${adapter.entityName} ${JSON.stringify(eventContents)} ${JSON.stringify(event)}`)
                // const contents = await eventContents
                // console.log(`Processing Event: ${adapter.entityName} ${JSON.stringify(contents)} ${JSON.stringify(event)}`)
                await adapter.persist(await eventContents)

                // Update sync state on each event
                blockchainSyncState = { ...blockchainSyncState, lastSeenBlockNumber: event.blockNumber }
                await this.updateBlockchainSyncState(blockchainSyncState)
            })
            this.pendingProcessing.push(pendingProcessing)
        })
    }

    private compareEvents(e1: Log, e2: Log) {
        if (e1.blockNumber > e2.blockNumber) {
            return 1
        } else if (e1.blockNumber < e2.blockNumber) {
            return -1
        } else {
            return e1.transactionIndex - e2.transactionIndex
        }
    }

    private trackBlockNumber(provider: Provider) {
        if (provider instanceof WebSocketProvider) {
            // If this is a websocket provider, events may arrive any time
            // relative to the actual block event. Therefore, we cannot be
            // absolutely sure we've processed all events because in theory,
            // a single event delivery could be delayed almost indefinitely.
            // Therefore, we need to make some assumptions:
            //  1) Since all events come over the same websocket, any
            //  network issues will affect all events equally, so it is
            //  very unlikely to get a block event but miss other events
            //  2) The blockchain provider will likely send all of the
            //  events reasonably rapidly.
            //
            // Based on the above, we will make the assumption that all events
            // for a block will be received and begin processing within
            // 500ms of the block event being received.
            provider.on("block", async (blockNumber) => {
                await new Promise((resolve) => setTimeout(resolve, 500))
                await this.waitToUpdateProcessedBlockNumber(blockNumber)
            })
        } else {
            // If this is a polling provider, all events for a particular
            // block will be discovered atomically during a single polling
            // cycle. We have a convenient "didPoll" event which fires only
            // after processing for all events discovered during that
            // block have begun (but not necessarily finished)

            const pollIdToBlock: Record<number, number> = {}

            // didPoll doesn't provide block number, only
            // poll id, so have to cross reference with
            // poll event
            provider.on("poll", (pollId, blockNumber) => {
                pollIdToBlock[pollId] = blockNumber
            })

            // this only fires when all events have been
            // dispatched, so by the time this comes around,
            // this.pendingProcessing should be completely
            // populated
            provider.on("didPoll", async (pollId) => {
                const blockNumber = pollIdToBlock[pollId]
                delete pollIdToBlock[pollId]

                await this.waitToUpdateProcessedBlockNumber(blockNumber)
            })
        }
    }

    private async waitToUpdateProcessedBlockNumber(blockNumber: number) {
        const pendingProcessingSnapshot = this.pendingProcessing
        await Promise.all(pendingProcessingSnapshot)
        // Remove all the promises we were waiting for from the list
        // It is possible that more were added in the meantime, which is why we don't clear it completely
        this.pendingProcessing = this.pendingProcessing.filter((promise) => !pendingProcessingSnapshot.includes(promise))
        if (blockNumber > this.lastProcessedBlockNumber.getValue()) {
            console.log("lastProcessedBlockNumber updated to: ", blockNumber)
            this.lastProcessedBlockNumber.next(blockNumber)
        }
    }
}
