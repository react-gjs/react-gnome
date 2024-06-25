import type GLib from "gi://GLib?version=2.0";
import Soup from "gi://Soup?version=2.4";
import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills("XMLHttpRequest")(() => {
  type RequestWithEventHandlers = {
    onabort?: (ev: ProgressEvent) => void;
    onerror?: (ev: ProgressEvent) => void;
    onload?: (ev: ProgressEvent) => void;
    onloadend?: (ev: ProgressEvent) => void;
    onloadstart?: (ev: ProgressEvent) => void;
    onprogress?: (ev: ProgressEvent) => void;
    ontimeout?: (ev: ProgressEvent) => void;
    onreadystatechange?: (ev: ProgressEvent) => void;
  };

  type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

  type RequestBody =
    | string
    | ArrayBuffer
    | TypedArray
    | FormData
    | URLSearchParams
    | null;

  type ResponseType = "" | "arraybuffer" | "blob" | "json" | "text";

  type EventListener =
    | ((ev: ProgressEvent) => void)
    | {
      handleEvent: (ev: ProgressEvent) => void;
    };

  enum RequestEvents {
    READY_STATE_CHANGE = "readystatechange",
    ABORT = "abort",
    ERROR = "error",
    LOAD = "load",
    LOAD_END = "loadend",
    LOAD_START = "loadstart",
    PROGRESS = "progress",
    TIMEOUT = "timeout",
  }

  enum ReadyState {
    UNSENT = 0,
    OPENED = 1,
    HEADERS_RECEIVED = 2,
    LOADING = 3,
    DONE = 4,
  }

  function typedArrayToString(array: TypedArray | ArrayBuffer): string {
    const decoder = new TextDecoder();
    return decoder.decode(array);
  }

  class ProgressEvent<T = any> {
    readonly loaded = 0;
    readonly total = 1;
    readonly lengthComputable = false;

    constructor(
      public readonly type: string,
      public readonly target: T | null,
    ) {}
  }

  class EventController {
    private listeners: Map<RequestEvents, Array<EventListener>> = new Map();

    constructor(request: RequestWithEventHandlers) {
      this.add(RequestEvents.ABORT, (e) => request.onabort?.(e));
      this.add(RequestEvents.ERROR, (e) => request.onerror?.(e));
      this.add(RequestEvents.LOAD, (e) => request.onload?.(e));
      this.add(RequestEvents.LOAD_END, (e) => request.onloadend?.(e));
      this.add(RequestEvents.LOAD_START, (e) => request.onloadstart?.(e));
      this.add(RequestEvents.PROGRESS, (e) => request.onprogress?.(e));
      this.add(RequestEvents.TIMEOUT, (e) => request.ontimeout?.(e));

      this.add(
        RequestEvents.READY_STATE_CHANGE,
        (e) => request.onreadystatechange?.(e),
      );
    }

    add(event: RequestEvents, listener: EventListener) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(listener);
    }

    remove(event: RequestEvents, listener: EventListener) {
      if (!this.listeners.has(event)) {
        return;
      }
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    emit(event: RequestEvents, ev: ProgressEvent) {
      if (!this.listeners.has(event)) {
        return;
      }
      this.listeners.get(event)!.forEach(async (listener) => {
        try {
          if (typeof listener === "function") await listener(ev);
          else await listener.handleEvent(ev);
        } catch (e) {
          console.error(e);
        }
      });
    }

    clear() {
      this.listeners.clear();
    }
  }

  class HeadersList {
    private headers: Map<string, string> = new Map();

    replace(headersString: string) {
      this.headers.clear();
      const headers = headersString.split("\r\n");

      for (const header of headers) {
        const [key, value] = header.split(": ");
        this.headers.set(key!, value!);
      }
    }

    set(name: string, value: string) {
      this.headers.set(name, value);
    }

    get(name: string): string | undefined {
      return this.headers.get(name);
    }

    getAll(): string {
      let result = "";
      this.headers.forEach((value, key) => {
        result += `${key}: ${value}\r\n`;
      });
      return result;
    }

    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach(callback);
    }

    freeze() {
      Object.freeze(this);
      Object.freeze(this.headers);
    }

    clear() {
      this.headers.clear();
    }
  }

  class ContentType {
    private readonly content: string[];
    constructor(private readonly type: string) {
      this.content = type.split(";").map((e) => e.trim());
    }

    is(type: string) {
      return this.content[0] === type;
    }

    isOfType(type: string) {
      const [mainType] = this.content[0]!.split("/");
      return mainType === type;
    }

    toString() {
      return this.type;
    }

    toType(): ResponseType {
      if (this.isOfType("text")) {
        return "text";
      } else if (this.is("application/json")) {
        return "json";
      } else if (this.is("application/octet-stream")) {
        return "arraybuffer";
      } else if (
        this.isOfType("image")
        || this.isOfType("audio")
        || this.isOfType("video")
      ) {
        return "blob";
      }
      return "";
    }
  }

  type RequestConfig = {
    method: string;
    url: string;
    async: boolean;
    username: string | null | undefined;
    password: string | null | undefined;
  };

  class XMLHttpRequest {
    // #region enum

    readonly DONE = ReadyState.DONE;
    readonly HEADERS_RECEIVED = ReadyState.HEADERS_RECEIVED;
    readonly LOADING = ReadyState.LOADING;
    readonly OPENED = ReadyState.OPENED;
    readonly UNSENT = ReadyState.UNSENT;
    static readonly DONE = ReadyState.DONE;
    static readonly HEADERS_RECEIVED = ReadyState.HEADERS_RECEIVED;
    static readonly LOADING = ReadyState.LOADING;
    static readonly OPENED = ReadyState.OPENED;
    static readonly UNSENT = ReadyState.UNSENT;

    // #endregion

    // #region unused

    withCredentials!: boolean;

    // #endregion

    private _requestConfig: RequestConfig = {
      method: "GET",
      url: "",
      async: true,
      username: null as string | null | undefined,
      password: null as string | null | undefined,
    };

    private _currentReadyState: ReadyState = ReadyState.UNSENT;
    private _responseBuffer: Uint8Array | null = null;
    private _responseType: ResponseType | null = null;
    private _responseURL: string | null = null;
    private _contentType: ContentType | null = null;
    private _eventController = new EventController(this);
    private _requestHeaders = new HeadersList();
    private _responseHeaders = new HeadersList();
    private _status: null | number = null;
    private _statusText: null | string = null;
    private _searchParams: URLSearchParams | null = null;
    private _abortCallback: (() => void) | null = null;

    private _body: any = null;

    get readyState() {
      return this._currentReadyState;
    }

    get response(): ArrayBuffer | Blob | Document | object | string | null {
      if (this._currentReadyState === ReadyState.DONE) {
        return this._parseResponseData();
      }
      return null;
    }

    get responseText(): string | null {
      const decoder = new TextDecoder();
      if (this._responseBuffer) {
        return decoder.decode(this._responseBuffer);
      }
      return null;
    }

    get responseXML(): string | null {
      return null;
    }

    get responseType(): ResponseType {
      if (this._responseType === null) {
        return this._contentType?.toType() ?? "";
      }
      return this._responseType;
    }

    set responseType(type: ResponseType) {
      this._responseType = type;
    }

    get responseURL(): string {
      return this._responseURL ?? this._getFullUrl();
    }

    get status(): number {
      return this._status ?? 0;
    }

    get statusText(): string {
      return this._statusText ?? "";
    }

    timeout = 60000;

    // #region handlers

    onabort = (ev: ProgressEvent) => {};
    onerror = (ev: ProgressEvent) => {};
    onload = (ev: ProgressEvent) => {};
    onloadend = (ev: ProgressEvent) => {};
    onloadstart = (ev: ProgressEvent) => {};
    onprogress = (ev: ProgressEvent) => {};
    ontimeout = (ev: ProgressEvent) => {};

    // #endregion

    private _parseResponseData() {
      switch (this.responseType) {
        case "json":
          return JSON.parse(this.responseText!);
        case "arraybuffer":
          return this._responseBuffer!.slice();
        case "blob":
          return new Blob([this._responseBuffer!]);
        case "text":
        case "":
          return this.responseText!;
      }
    }

    private _loadRequestBody(body?: RequestBody) {
      if (body) {
        if (typeof body === "string") {
          this._body = body;
          return;
        }

        if (
          body instanceof ArrayBuffer
          || ("buffer" in body && body.buffer instanceof ArrayBuffer)
        ) {
          this._body = typedArrayToString(body);
          return;
        }

        if (body instanceof FormData) {
          const bodyData: Record<string, string> = {};
          body.forEach((value, key) => {
            bodyData[key] = value as string;
          });
          this._body = JSON.stringify(bodyData);
          return;
        }

        if (body instanceof URLSearchParams) {
          this._searchParams = body;
          return;
        }

        this._body = JSON.stringify(body);
      }
    }

    private _setReadyState(readyState: ReadyState) {
      if (this._currentReadyState >= readyState) return;

      this._currentReadyState = readyState;

      this._eventController.emit(
        RequestEvents.READY_STATE_CHANGE,
        new ProgressEvent(RequestEvents.READY_STATE_CHANGE, this),
      );
    }

    private _getFullUrl() {
      const { url, username, password } = this._requestConfig;
      const urlObj = new URL(url);

      if (username) {
        urlObj.username = username;
      }

      if (password) {
        urlObj.password = password;
      }

      if (this._searchParams) {
        for (const [key, value] of this._searchParams) {
          urlObj.searchParams.set(key, value);
        }
      }

      return urlObj.toString();
    }

    private _getTimeout() {
      if (this.timeout <= 0) return 60 * 60; // 1 hour
      return Math.max(1, Math.floor(this.timeout / 1000));
    }

    private _getSoupMessage() {
      const method = this._requestConfig.method;
      const fullUrl = this._getFullUrl();

      const message = Soup.Message.new(this._requestConfig.method, fullUrl);

      if (!message) {
        throw new Error(`Unable to create a message for ${method} ${fullUrl}`);
      }

      this._requestHeaders.forEach((value, key) => {
        message.request_headers!.append(key, value);
      });

      if (this._body) {
        const contentType = this._requestHeaders.get("Content-Type");
        message.set_request(
          contentType ?? "application/json",
          Soup.MemoryUse.COPY,
          this._body,
        );
      }

      return message;
    }

    private _finishRequest(status_code: number) {
      const ok = status_code >= 200 && status_code < 300;

      this._setReadyState(ReadyState.DONE);

      this._eventController.emit(
        RequestEvents.LOAD_END,
        new ProgressEvent(RequestEvents.LOAD_END, this),
      );

      if (ok) {
        this._eventController.emit(
          RequestEvents.LOAD,
          new ProgressEvent(RequestEvents.LOAD, this),
        );
      } else if (status_code === 7) {
        this._eventController.emit(
          RequestEvents.TIMEOUT,
          new ProgressEvent(RequestEvents.TIMEOUT, this),
        );
      } else if (status_code === 1) {
        this._eventController.emit(
          RequestEvents.ABORT,
          new ProgressEvent(RequestEvents.ABORT, this),
        );
      } else {
        this._eventController.emit(
          RequestEvents.ERROR,
          new ProgressEvent(RequestEvents.ERROR, this),
        );
      }
    }

    private async _sendAsync() {
      try {
        const httpSession = new Soup.SessionAsync();

        const message = this._getSoupMessage();

        httpSession.timeout = this._getTimeout();

        this._abortCallback = () => httpSession.abort();

        const headersReading = new Promise<void>((resolve, reject) => {
          try {
            message.connect("got-headers", (message) => {
              const { response_headers } = message;

              this._responseHeaders.clear();
              response_headers!.foreach((name, value) => {
                this._responseHeaders.set(name!, value!);
              });

              this._setReadyState(ReadyState.HEADERS_RECEIVED);

              resolve();
            });
          } catch (e) {
            reject();
          }
        });

        const chunkReading = new Promise<void>((resolve, reject) => {
          let onReceived = () => {
            this._setReadyState(ReadyState.LOADING);
            this._eventController.emit(
              RequestEvents.PROGRESS,
              new ProgressEvent(RequestEvents.PROGRESS, this),
            );
            onReceived = () => {
              this._eventController.emit(
                RequestEvents.PROGRESS,
                new ProgressEvent(RequestEvents.PROGRESS, this),
              );
            };
          };
          try {
            message.connect("got-chunk", (_, chunk) => {
              onReceived();
              // TODO: track progress
            });
            message.connect("finished", () => resolve());
          } catch (e) {
            reject();
          }
        });

        const response = await new Promise<{
          rawResponseData: GLib.Bytes;
          responseType: string | null;
          responseUrl: string;
          statusCode: number;
          statusText: string;
        }>((resolve, reject) => {
          try {
            httpSession.queue_message(message, (_, msg) => {
              const contentType = msg!.response_headers!.get_one("Content-Type")
                ?? null;

              resolve({
                rawResponseData: msg!.response_body_data,
                responseType: contentType,
                responseUrl: msg!.uri.to_string(true)!,
                statusCode: msg!.status_code,
                statusText: msg!.reason_phrase!,
              });
            });
          } catch (e) {
            reject(e);
          }
        });

        if (response.statusCode > 99) {
          await headersReading;
          await chunkReading;
        }

        this._contentType = response.responseType
          ? new ContentType(response.responseType)
          : null;
        this._status = response.statusCode;
        this._statusText = response.statusText;
        this._responseBuffer = response.rawResponseData.toArray() as any;

        this._finishRequest(response.statusCode);
      } catch (e) {
        this._eventController.emit(
          RequestEvents.ERROR,
          new ProgressEvent(RequestEvents.ERROR, this),
        );
      }
    }

    private _sendSync() {
      const httpSession = new Soup.SessionSync();

      const message = this._getSoupMessage();

      httpSession.timeout = this._getTimeout();

      this._setReadyState(ReadyState.LOADING);
      this._eventController.emit(
        RequestEvents.LOAD_START,
        new ProgressEvent(RequestEvents.LOAD_START, this),
      );

      httpSession.send_message(message);

      const { status_code, reason_phrase, response_headers } = message;

      this._responseHeaders.clear();
      response_headers!.foreach((name, value) => {
        this._responseHeaders.set(name!, value!);
      });

      this._setReadyState(ReadyState.HEADERS_RECEIVED);

      const contentType = response_headers!.get_content_type() as any as
        | string
        | null;

      this._contentType = contentType ? new ContentType(contentType) : null;
      this._status = status_code;
      this._statusText = reason_phrase;
      this._responseBuffer = message.response_body_data.toArray() as any;
      this._responseURL = message.uri.to_string(true);

      this._finishRequest(status_code);
    }

    abort() {
      this._abortCallback?.();
    }

    getAllResponseHeaders(): string {
      return this._responseHeaders.getAll();
    }

    getResponseHeader(header: string): string | null {
      return this._responseHeaders.get(header) ?? null;
    }

    setRequestHeader(name: string, value: string) {
      this._requestHeaders.set(name, value);
    }

    open(
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      this._requestConfig = {
        method,
        url: url.toString(),
        async: async ?? true,
        username,
        password,
      };

      Object.freeze(this._requestConfig);
      this._requestHeaders.freeze();

      this._setReadyState(ReadyState.OPENED);
    }

    overrideMimeType(mime: string) {}

    send(body?: RequestBody) {
      this._loadRequestBody(body);

      if (this._requestConfig.async) {
        this._sendAsync();
      } else {
        this._sendSync();
      }
    }

    addEventListener(type: RequestEvents, listener: EventListener) {
      this._eventController.add(type, listener);
    }

    removeEventListener(type: RequestEvents, listener: EventListener) {
      this._eventController.remove(type, listener);
    }
  }

  return {
    XMLHttpRequest,
  };
});
