import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface WebSocketMessage {
    type: string
    timestamp: string
    data?: any
    pipeline_id?: number
}

export class WebSocketService {
    private client: Client | null = null
    private connected = false
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 2000
    private onMessageCallback?: (message: WebSocketMessage) => void
    private onErrorCallback?: (error: any) => void

    constructor() {
        // setup happens in connect()
    }

    connect(onMessage?: (message: WebSocketMessage) => void, onError?: (error: any) => void): void {
        if (this.connected) {
            console.log('websocket already connected')
            return
        }

        this.onMessageCallback = onMessage
        this.onErrorCallback = onError

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

        try {
            this.client = new Client({
                webSocketFactory: () => new SockJS(`${API_URL}/ws/dashboard`),
                connectHeaders: {},
                debug: (str) => {
                    console.log('websocket debug:', str)
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            })

            this.client.onConnect = (frame) => {
                console.log('✅ websocket connected successfully')
                this.connected = true
                this.reconnectAttempts = 0

                this.client?.subscribe('/topic/dashboard', (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        console.log('📡 websocket message received:', data.type)

                        if (this.onMessageCallback) {
                            this.onMessageCallback(data)
                        }
                    } catch (error) {
                        console.error('failed to parse websocket message:', error)
                    }
                })

                this.client?.publish({
                    destination: '/app/dashboard/subscribe',
                    body: JSON.stringify({ action: 'subscribe' })
                })
            }

            this.client.onStompError = (frame) => {
                console.error('❌ websocket stomp error:', frame.headers['message'])
                this.connected = false

                if (this.onErrorCallback) {
                    this.onErrorCallback(frame.headers['message'])
                }

                this.handleReconnect()
            }

            this.client.onWebSocketError = (error) => {
                console.error('❌ websocket error:', error)
                this.connected = false

                if (this.onErrorCallback) {
                    this.onErrorCallback(error)
                }
            }

            this.client.onDisconnect = () => {
                console.log('📡 websocket disconnected')
                this.connected = false
            }

            this.client.activate()

        } catch (error) {
            console.error('failed to setup websocket:', error)
            if (this.onErrorCallback) {
                this.onErrorCallback(error)
            }
        }
    }

    disconnect(): void {
        if (this.client && this.connected) {
            console.log('disconnecting websocket...')
            this.client.deactivate()
            this.connected = false
        }
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('max websocket reconnect attempts reached')
            return
        }

        this.reconnectAttempts++
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

        console.log(`attempting websocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

        setTimeout(() => {
            if (!this.connected) {
                this.connect(this.onMessageCallback, this.onErrorCallback)
            }
        }, delay)
    }

    sendPing(): void {
        if (this.client && this.connected) {
            this.client.publish({
                destination: '/app/dashboard/ping',
                body: JSON.stringify({ timestamp: new Date().toISOString() })
            })
        }
    }

    isConnected(): boolean {
        return this.connected
    }

    subscribeToPipeline(pipelineId: number, callback: (message: WebSocketMessage) => void): void {
        if (this.client && this.connected) {
            this.client.subscribe(`/topic/pipeline/${pipelineId}`, (message) => {
                try {
                    const data = JSON.parse(message.body)
                    callback(data)
                } catch (error) {
                    console.error('failed to parse pipeline message:', error)
                }
            })
        }
    }
}