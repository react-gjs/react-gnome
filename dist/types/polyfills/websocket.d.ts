import type { EventListener } from "./shared/event-emitter";
import { Event } from "./shared/event-emitter";
declare namespace WsPolyfill {
    type WebSocketEvent = any;
    type WebSocketEventListener = EventListener<WebSocketEvent>;
    enum WebSocketEventType {
        CLOSE = "close",
        ERROR = "error",
        MESSAGE = "message",
        OPEN = "open"
    }
    export class WebSocket {
        #private;
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSING = 2;
        static readonly CLOSED = 3;
        readonly CONNECTING = 0;
        readonly OPEN = 1;
        readonly CLOSING = 2;
        readonly CLOSED = 3;
        binaryType: BinaryType;
        get bufferedAmount(): number;
        get extensions(): string;
        get protocol(): string;
        get readyState(): number;
        get url(): string;
        onclose: ((this: WebSocket, ev: Event) => any) | null;
        onerror: ((this: WebSocket, ev: Event) => any) | null;
        onmessage: ((this: WebSocket, ev: Event) => any) | null;
        onopen: ((this: WebSocket, ev: Event) => any) | null;
        constructor(url: string | URL, protocols?: string | string[]);
        send(data: string | Uint8Array | ArrayBuffer | Blob): Promise<void>;
        close(code?: number, reason?: string): void;
        addEventListener(type: WebSocketEventType, listener: WebSocketEventListener, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(type: WebSocketEventType, listener: WebSocketEventListener): void;
    }
    export {};
}
export declare const WebSocket: typeof WsPolyfill.WebSocket;
export {};
