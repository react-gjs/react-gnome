import GLib from "gi://GLib";
import Soup from "gi://Soup";
import type { EventListener } from "./shared/event-emitter";
import { Event, EventEmitter } from "./shared/event-emitter";
import { _async } from "./shared/utils";

namespace WsPolyfill {
  type WebSocketEvent = any;

  type WebSocketEventListener = EventListener<WebSocketEvent>;

  enum WebSocketEventType {
    CLOSE = "close",
    ERROR = "error",
    MESSAGE = "message",
    OPEN = "open",
  }

  export class WebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = WebSocket.CONNECTING;
    readonly OPEN = WebSocket.OPEN;
    readonly CLOSING = WebSocket.CLOSING;
    readonly CLOSED = WebSocket.CLOSED;

    #emitter = new EventEmitter<WebSocketEventType, WebSocketEvent>();
    #connection?: Soup.WebsocketConnection;
    #bufferedAmount = 0;
    #extensions = "";
    #protocol = "";
    #readyState: number = WebSocket.CONNECTING;
    #uriObject: GLib.Uri;

    binaryType: BinaryType = "arraybuffer";

    get bufferedAmount(): number {
      return this.#bufferedAmount;
    }

    get extensions(): string {
      return this.#extensions;
    }

    get protocol(): string {
      return this.#protocol;
    }

    get readyState(): number {
      return this.#readyState;
    }

    get url(): string {
      return this.#uriObject.to_string();
    }

    onclose: ((this: WebSocket, ev: Event) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: Event) => any) | null = null;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;

    constructor(url: string | URL, protocols: string | string[] = []) {
      this.#emitter.add(WebSocketEventType.CLOSE, (e) => this.onclose?.(e));
      this.#emitter.add(WebSocketEventType.ERROR, (e) => this.onerror?.(e));
      this.#emitter.add(WebSocketEventType.MESSAGE, (e) => this.onmessage?.(e));
      this.#emitter.add(WebSocketEventType.OPEN, (e) => this.onopen?.(e));

      this.#uriObject = GLib.uri_parse(url.toString(), GLib.UriFlags.NONE);

      this.#startConnection(Array.isArray(protocols) ? protocols : [protocols]);
    }

    #cleanup() {
      this.#emitter.clear();
    }

    #setupConnection() {
      this.#protocol = this.#connection!.get_protocol()!;

      this.#connection!.connect("closing", () => {
        this.#readyState = WebSocket.CLOSING;
      });

      this.#connection!.connect("closed", () => {
        this.#readyState = WebSocket.CLOSED;
        this.#emitter.emit(WebSocketEventType.CLOSE, Event.create({}));
        this.#cleanup();
      });

      this.#connection!.connect("error", (_, error) => {
        this.#emitter.emit(WebSocketEventType.ERROR, Event.create({ error }));
      });

      this.#connection!.connect("message", (message, type, data) => {
        const origin = message.get_origin();

        if (type === Soup.WebsocketDataType.TEXT) {
          const text = new TextDecoder().decode(data.unref_to_array());
          this.#emitter.emit(
            WebSocketEventType.MESSAGE,
            Event.create({ origin, data: text })
          );
        } else {
          this.#emitter.emit(
            WebSocketEventType.MESSAGE,
            Event.create({ origin, data: data.unref_to_array() })
          );
        }
      });
    }

    async #startConnection(protocols: string[]) {
      try {
        const session = new Soup.Session();
        const message = Soup.Message.new("GET", this.#uriObject.to_string())!;

        const connection = await _async<Soup.WebsocketConnection>((p) => {
          session.websocket_connect_async(
            message,
            "origin",
            protocols,
            null,
            (_, response) => {
              try {
                const connection = session.websocket_connect_finish(response);
                p.resolve(connection);
              } catch (e) {
                p.reject(e);
              }
            }
          );
        });

        this.#connection = connection;
        this.#setupConnection();

        this.#readyState = WebSocket.OPEN;
        this.#emitter.emit(WebSocketEventType.OPEN, Event.create({}));
      } catch (error) {
        this.#readyState = WebSocket.CLOSED;
        this.#emitter.emit(WebSocketEventType.ERROR, Event.create({ error }));
      }
    }

    async send(data: string | Uint8Array | ArrayBuffer | Blob) {
      let bytes: GLib.Bytes;
      let type: Soup.WebsocketDataType;

      if (typeof data === "string") {
        bytes = new GLib.Bytes(new TextEncoder().encode(data));
        type = Soup.WebsocketDataType.TEXT;
      } else if (data instanceof Uint8Array) {
        bytes = new GLib.Bytes(data);
        type = Soup.WebsocketDataType.BINARY;
      } else if (data instanceof ArrayBuffer) {
        bytes = new GLib.Bytes(new Uint8Array(data));
        type = Soup.WebsocketDataType.BINARY;
      } else {
        const array = await data.arrayBuffer();
        bytes = new GLib.Bytes(new Uint8Array(array));
        type = Soup.WebsocketDataType.BINARY;
      }

      this.#connection!.send_message(type, bytes);
    }

    close(code?: number, reason?: string): void {
      this.#connection!.close(
        code ?? Soup.WebsocketCloseCode.NORMAL,
        reason ?? null
      );
    }

    addEventListener(
      type: WebSocketEventType,
      listener: WebSocketEventListener,
      options?: boolean | AddEventListenerOptions
    ): void {
      this.#emitter.add(type, listener, options);
    }

    removeEventListener(
      type: WebSocketEventType,
      listener: WebSocketEventListener
    ): void {
      this.#emitter.remove(type, listener);
    }
  }
}

export const WebSocket = WsPolyfill.WebSocket;
