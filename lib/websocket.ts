// enhanced websocket service using stomp/sockjs for backend compatibility
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export class WebSocketService {
    private stompClient: Client | null = null
    private isConnected = false
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5

    connect(onMessage: (data: any) => void, onError?: (error: any) => void) {
        try {
            const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

            this.stompClient = new Client({
                webSocketFactory: () => new SockJS(`${wsUrl}/ws/dashboard`),
                debug: (str) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('stomp debug:', str)
                    }
                },
                reconnectDelay: 2000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            })

            this.stompClient.onConnect = () => {
                console.log('websocket connected via stomp')
                this.isConnected = true
                this.reconnectAttempts = 0

                // subscribe to dashboard updates
                this.stompClient?.subscribe('/topic/dashboard', (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        onMessage(data)
                    } catch (e) {
                        console.error('failed to parse websocket message:', e)
                    }
                })

                // subscribe to build updates
                this.stompClient?.subscribe('/topic/builds', (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        onMessage(data)
                    } catch (e) {
                        console.error('failed to parse build update:', e)
                    }
                })
            }

            this.stompClient.onDisconnect = () => {
                console.log('websocket disconnected')
                this.isConnected = false
                // don't auto-reconnect to avoid error spam
            }

            this.stompClient.onStompError = (frame) => {
                console.log('stomp connection failed - continuing without websocket')
                onError?.(frame)
                // don't reconnect automatically
            }

            this.stompClient.onWebSocketError = (error) => {
                console.log('websocket connection failed - continuing without websocket')
                onError?.(error)
                // don't reconnect automatically  
            }

            this.stompClient.activate()
        } catch (error) {
            console.log('websocket setup failed - using polling only')
            onError?.(error)
            this.fallbackPolling(onMessage)
        }
    }

    private reconnect(onMessage: (data: any) => void, onError?: (error: any) => void) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`reconnecting websocket attempt ${this.reconnectAttempts}`)
            setTimeout(() => this.connect(onMessage, onError), 2000 * this.reconnectAttempts)
        } else {
            console.log('max reconnect attempts reached, falling back to polling')
            this.fallbackPolling(onMessage)
        }
    }

    private fallbackPolling(onMessage: (data: any) => void) {
        // fallback to polling every 30 seconds if websocket fails
        console.log('using polling fallback')
        setInterval(() => {
            onMessage({ type: 'polling_update', timestamp: Date.now() })
        }, 30000)
    }

    disconnect() {
        if (this.stompClient && this.isConnected) {
            this.stompClient.deactivate()
            this.stompClient = null
            this.isConnected = false
        }
    }

    sendMessage(destination: string, body: any) {
        if (this.stompClient && this.isConnected) {
            this.stompClient.publish({
                destination,
                body: JSON.stringify(body)
            })
        }
    }
}