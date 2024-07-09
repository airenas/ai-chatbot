import { io, Socket } from 'socket.io-client';

interface MessageHandler {
    (message: any): void;
}

interface ErrorHandler {
    (error: Error): void;
}

interface CloseHandler {
    (): void;
}

class WebSocketWrapper {
    private ws: Socket;
    private messageHandler: MessageHandler | null = null;
    private errorHandler: ErrorHandler | null = null;
    private closeHandler: CloseHandler | null = null;

    constructor(url: string) {
        console.log('server url', url)
        this.ws = io(url, { path: "/ai-demo-service/ws/socket.io" })

        this.ws.on('connect', () => {
            console.log('ws connected')
        });

        this.ws.on('message', (data: any) => {
            // console.log('on message', data)
            if (this.messageHandler) {
                // console.log('send to on message', data)
                this.messageHandler(data);
            }
        });

        this.ws.on('error', (error: Error) => {
            console.log('WebSocket error', error)
            if (this.errorHandler) {
                this.errorHandler(error);
            }
        });

        this.ws.on('disconnect', () => {
            console.log('WebSocket disconnect')
            if (this.closeHandler) {
                this.closeHandler();
            }
        });
    }

    sendTxt(id: string, data: any): void {
        console.log('send message', data, id)
        if (this.ws) {
            this.ws.emit('message', { type: "TEXT", data: data, id: id, who: "USER" });
        } else {
            console.warn("no socket")
        }
    }

    sendAudio(id: string, data: any): void {
        // console.log('send message', data, id)
        if (this.ws) {
            this.ws.emit('message', { type: "AUDIO", data: data, id: id, who: "USER" });
        } else {
            console.warn("no socket")
        }
    }

    sendAudioEvent(id: string, start: boolean) {
        if (this.ws) {
            const msg = start ? "AUDIO_START" : "AUDIO_STOP"
            console.log('send event', msg, id)
            this.ws.emit('message', { type: "EVENT", data: msg, id: id, who: "USER" });
        } else {
            console.warn("no socket")
        }
    }

    setMessageHandler(handler: MessageHandler): void {
        this.messageHandler = handler;
    }

    setErrorHandler(handler: ErrorHandler): void {
        this.errorHandler = handler;
    }

    setCloseHandler(handler: CloseHandler): void {
        this.closeHandler = handler;
    }

    close(): void {
        this.ws.close();
    }
}

let ws: WebSocketWrapper | null = null;

export function getWS(): WebSocketWrapper {
    const url = process.env.NEXT_PUBLIC_WS_URL || '__WS_URL__' // does not work env setting!
    if (ws === null) {
        ws = new WebSocketWrapper(url)
    }
    return ws
}

export function dropWS() {
    if (ws !== null) {
        ws.close()
        ws = null
    }
    return ws
}