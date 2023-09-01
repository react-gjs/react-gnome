// src/polyfills/websocket.ts
import GLib from "gi://GLib?version=2.0";
import Soup from "gi://Soup?version=2.4";
import { Event, EventEmitter } from "./shared/event-emitter.mjs";
import { _async } from "./shared/utils.mjs";
var WsPolyfill;
((WsPolyfill2) => {
  let WebSocketEventType;
  ((WebSocketEventType2) => {
    WebSocketEventType2["CLOSE"] = "close";
    WebSocketEventType2["ERROR"] = "error";
    WebSocketEventType2["MESSAGE"] = "message";
    WebSocketEventType2["OPEN"] = "open";
  })(WebSocketEventType || (WebSocketEventType = {}));
  class WebSocketConnectionError extends Error {
    constructor(statusCode, statusText, responseBody, err) {
      super("WebSocket connection failed.");
      this.statusCode = statusCode;
      this.statusText = statusText;
      this.responseBody = responseBody;
      this.err = err;
      this.name = "WebSocketConnectionError";
    }
  }
  class WebSocket2 {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    CONNECTING = WebSocket2.CONNECTING;
    OPEN = WebSocket2.OPEN;
    CLOSING = WebSocket2.CLOSING;
    CLOSED = WebSocket2.CLOSED;
    #emitter = new EventEmitter();
    #connection;
    #bufferedAmount = 0;
    #extensions = "";
    #protocol = "";
    #readyState = WebSocket2.CONNECTING;
    #uri;
    binaryType = "arraybuffer";
    get bufferedAmount() {
      return this.#bufferedAmount;
    }
    get extensions() {
      return this.#extensions;
    }
    get protocol() {
      return this.#protocol;
    }
    get readyState() {
      return this.#readyState;
    }
    get url() {
      return this.#uri;
    }
    onclose = null;
    onerror = null;
    onmessage = null;
    onopen = null;
    constructor(url, protocols = []) {
      this.#emitter.add("close" /* CLOSE */, (e) => this.onclose?.(e));
      this.#emitter.add("error" /* ERROR */, (e) => this.onerror?.(e));
      this.#emitter.add("message" /* MESSAGE */, (e) => this.onmessage?.(e));
      this.#emitter.add("open" /* OPEN */, (e) => this.onopen?.(e));
      this.#uri = url.toString();
      this.#startConnection(Array.isArray(protocols) ? protocols : [protocols]);
    }
    #cleanup() {
      this.#emitter.clear();
    }
    #setupConnection() {
      this.#protocol = this.#connection.get_protocol();
      this.#connection.connect("closing", () => {
        this.#readyState = WebSocket2.CLOSING;
      });
      this.#connection.connect("closed", () => {
        this.#readyState = WebSocket2.CLOSED;
        this.#emitter.emit("close" /* CLOSE */, Event.create({}));
        this.#cleanup();
      });
      this.#connection.connect("error", (_, error) => {
        this.#emitter.emit("error" /* ERROR */, Event.create({ error }));
      });
      this.#connection.connect("message", (message, type, data) => {
        const origin = message.get_origin();
        if (type === Soup.WebsocketDataType.TEXT) {
          const text = new TextDecoder().decode(data.toArray());
          this.#emitter.emit(
            "message" /* MESSAGE */,
            Event.create({ origin, data: text })
          );
        } else {
          this.#emitter.emit(
            "message" /* MESSAGE */,
            Event.create({ origin, data: data.toArray() })
          );
        }
      });
    }
    async #startConnection(protocols) {
      try {
        const uri = new Soup.URI(this.#uri);
        const session = new Soup.Session();
        const message = new Soup.Message({
          method: "GET",
          uri
        });
        const connection = await _async((p) => {
          session.websocket_connect_async(
            message,
            "origin",
            protocols,
            null,
            (_, response) => {
              try {
                const connection2 = session.websocket_connect_finish(response);
                p.resolve(connection2);
              } catch (e) {
                p.reject(
                  new WebSocketConnectionError(
                    message.status_code,
                    message.reason_phrase ?? "",
                    message.response_body.data,
                    e
                  )
                );
              }
            }
          );
        });
        this.#connection = connection;
        this.#setupConnection();
        this.#readyState = WebSocket2.OPEN;
        this.#emitter.emit("open" /* OPEN */, Event.create({}));
      } catch (error) {
        this.#readyState = WebSocket2.CLOSED;
        this.#emitter.emit("error" /* ERROR */, Event.create({ error }));
      }
    }
    async send(data) {
      let bytes;
      let type;
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
      this.#connection.send_message(type, bytes);
    }
    close(code, reason) {
      this.#connection.close(
        code ?? Soup.WebsocketCloseCode.NORMAL,
        reason ?? null
      );
    }
    addEventListener(type, listener, options) {
      this.#emitter.add(type, listener, options);
    }
    removeEventListener(type, listener) {
      this.#emitter.remove(type, listener);
    }
  }
  WsPolyfill2.WebSocket = WebSocket2;
})(WsPolyfill || (WsPolyfill = {}));
var WebSocket = WsPolyfill.WebSocket;
export {
  WebSocket
};
