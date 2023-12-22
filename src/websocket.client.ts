import { WebSocketProvider } from "@ethersproject/providers"
import { ClientRequestArgs } from "http"
import { EventEmitter } from "stream"
import WebSocket from "ws"

const PING_DELAY = 4 * 1000
const PONG_TIMEOUT = 10 * 1000

type WebsocketState = "UNHEALTHY_WAITING_TO_RECONNECT" | "UNHEALTHY_CONNECTING" | "UNHEALTHY_CONNECTED" | "HEALTHY"

export class WebsocketClient {
    provider!: WebSocketProvider
    private websocket!: WebSocket

    private state: WebsocketState = "UNHEALTHY_CONNECTING"
    private connectAttempts = 0
    private pongTimeout: NodeJS.Timeout | null = null
    private pingTimeout: NodeJS.Timeout | null = null

    private emitter: EventEmitter = new EventEmitter()

    constructor(private address: string | URL, private options?: WebSocket.ClientOptions | ClientRequestArgs) {
        this.connect()
    }

    private connect() {
        this.connectAttempts++
        this.websocket = new WebSocket(this.address, this.options)
        this.state = "UNHEALTHY_CONNECTING"

        this.websocket.on("error", async (event) => {
            await this.handleError(event)
        })

        this.websocket.on("pong", () => {
            if (this.state !== "HEALTHY") {
                this.state = "HEALTHY"
                this.connectAttempts = 0
                console.log("Websocket is now healthy, connect successful")
                this.emitter.emit("connected")
            }
            this.queuePing()
            this.resetPongTimeout()
        })

        this.websocket.on("open", () => {
            this.state = "UNHEALTHY_CONNECTED"
            console.log("Websocket connected")
            this.doPing()
        })

        this.resetPongTimeout()

        this.provider = new WebSocketProvider(this.websocket)
    }

    private doPing() {
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.ping()
        }
    }

    private queuePing() {
        if (this.pingTimeout) clearTimeout(this.pingTimeout)

        this.pingTimeout = setTimeout(() => this.doPing(), PING_DELAY)
    }

    private resetPongTimeout() {
        if (this.pongTimeout) clearTimeout(this.pongTimeout)
        this.pongTimeout = setTimeout(async () => {
            await this.handleError(`Did not receive pong within ${PONG_TIMEOUT}ms`)
        }, PONG_TIMEOUT)
    }

    private async handleError(event: Error | string) {
        if (this.state === "UNHEALTHY_WAITING_TO_RECONNECT") return
        this.websocket.close()
        this.websocket.removeAllListeners()

        // Randomized Exponential backoff within 0ms, 100ms, 200ms, 400ms, up to 16s
        const delay = Math.min(16 * 1000, 2 ** Math.ceil(Math.random() * this.connectAttempts) * 100)
        console.log(`Websocket error, will reconnect after ${delay}ms: `, event)
        this.state = "UNHEALTHY_WAITING_TO_RECONNECT"

        await new Promise((resolve) => setTimeout(resolve, delay))

        console.log("Reconnecting...")
        this.connect()
    }

    onConnected(callback: (provider: WebSocketProvider) => void) {
        this.emitter.on("connected", callback)
    }
}
