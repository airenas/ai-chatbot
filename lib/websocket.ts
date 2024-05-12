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
        this.ws = io(url);

        this.ws.on('connect', () => {
            console.log('WebSocket connected')
            // Optionally, you can add some logic here when the connection is established.
        });

        this.ws.on('message', (data: any) => {
            console.log('on message', data)
            if (this.messageHandler) {
                console.log('send to on message', data)
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

    sendTxt(data: any): void {
        console.log('send message', data)
        if (this.ws) {
            this.ws.emit('message', { type: "TEXT", data: data });
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
    if (ws === null) {
        ws = new WebSocketWrapper('ws://localhost:8007')
    }
    return ws
}
