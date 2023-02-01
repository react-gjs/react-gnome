namespace AbortControllerPolyfill {
  enum Events {
    Abort = "abort",
  }

  class Event {
    constructor(public type: Events) {}
  }

  class EventController<E = Events> {
    private listeners: Map<E, Array<(ev: Event) => void>> = new Map();

    constructor() {}

    add(event: E, listener: (ev: Event) => void) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)!.push(listener);
    }

    remove(event: E, listener: (ev: Event) => void) {
      if (!this.listeners.has(event)) {
        return;
      }
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    emit(event: E, ev: Event) {
      if (!this.listeners.has(event)) {
        return;
      }
      this.listeners.get(event)!.forEach(async (listener) => {
        try {
          await listener(ev);
        } catch (e) {
          console.error(e);
        }
      });
    }

    clear() {
      this.listeners.clear();
    }
  }

  export class AbortError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AbortError";
    }
  }

  export class AbortSignal {
    static abort(reason?: any) {
      const signal = new AbortSignal();
      signal._abort(reason ?? new AbortError("Signal was aborted."));
      return signal;
    }

    static timeout(time: number) {
      const signal = new AbortSignal();

      setTimeout(() => {
        if (!signal.aborted) signal._abort(new AbortError("Timeout"));
      }, time);

      return signal;
    }

    private readonly _events = new EventController();
    private _isAborted = false;
    private _reason: any = null;

    public onabort: ((ev: Event) => void) | null = null;

    get aborted(): boolean {
      return this._isAborted;
    }

    get reason(): any {
      return this._reason;
    }

    constructor() {
      this._events.add(
        Events.Abort,
        () => this.onabort && this.onabort(new Event(Events.Abort))
      );
    }

    protected _abort(reason?: any) {
      if (this._isAborted) {
        return;
      }
      this._isAborted = true;
      this._reason = reason ?? new AbortError("Signal was aborted.");
      this._events.emit(Events.Abort, new Event(Events.Abort));
      this._events.clear();
    }

    throwIfAborted() {
      if (this._isAborted) {
        throw this._reason;
      }
    }

    addEventListener(event: Events, listener: (ev: Event) => void) {
      this._events.add(event, listener);
    }

    removeEventListener(event: Events, listener: (ev: Event) => void) {
      this._events.remove(event, listener);
    }
  }

  export class AbortController {
    private readonly _signal = new AbortSignal();

    get signal(): AbortSignal {
      return this._signal;
    }

    abort() {
      this._signal["_abort"]();
    }
  }
}

export const AbortController = AbortControllerPolyfill.AbortController;
export const AbortSignal = AbortControllerPolyfill.AbortSignal;
export const AbortError = AbortControllerPolyfill.AbortError;
