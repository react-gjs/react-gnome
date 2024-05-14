import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills(
  "AbortController",
  "AbortSignal",
  "AbortError",
  "TimeoutError"
)(() => {
  enum Events {
    Abort = "abort",
  }

  class Event {
    target: any;
    currentTarget: any;
    timeStamp: number = 0;

    bubbles = false;
    cancelable = false;
    cancelBubble = false;
    composed = false;
    defaultPrevented = false;
    eventPhase = 0;
    isTrusted = true;
    returnValue = true;

    constructor(public type: Events) {}
  }

  class EventController<E = Events> {
    private listeners: Map<E, Array<(this: any, ev: Event) => void>> =
      new Map();

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
          await listener.call(ev.target, ev);
        } catch (e) {
          console.error(e);
        }
      });
    }

    clear() {
      this.listeners.clear();
    }
  }

  class AbortError extends Error {
    code = 20;
    constructor(msg?: string) {
      super(msg ?? "signal is aborted without reason");
      this.name = "AbortError";
    }
  }

  class TimeoutError extends Error {
    code = 23;
    constructor() {
      super("signal timed out");
      this.name = "TimeoutError";
    }
  }

  class AbortSignal {
    static abort(reason?: any) {
      const signal = new AbortSignal();
      signal._isAborted = true;
      signal._reason = reason ?? new AbortError();
      return signal;
    }

    static timeout(time: number) {
      const signal = new AbortSignal();

      setTimeout(() => {
        if (!signal.aborted) signal._abort(new TimeoutError());
      }, time);

      return signal;
    }

    static any(signals: Iterable<AbortSignal>) {
      const signal = new AbortSignal();

      for (const s of signals) {
        s.addEventListener(Events.Abort, function (this: AbortSignal) {
          if (!signal.aborted) signal._abort(this.reason);
        });
      }

      return signal;
    }

    private readonly _events = new EventController();
    private _isAborted = false;
    private _reason: any = null;
    private _startTime = Date.now();

    public onabort: ((ev: Event) => void) | null = null;

    get aborted(): boolean {
      return this._isAborted;
    }

    get reason(): any {
      return this._reason;
    }

    constructor() {
      this._events.add(Events.Abort, (ev) => this.onabort && this.onabort(ev));
    }

    protected _abortEvent() {
      const e = new Event(Events.Abort);
      e.currentTarget = this;
      e.target = this;
      e.timeStamp = Math.round(Date.now() - this._startTime);
      return e;
    }

    protected _abort(reason?: any) {
      if (this._isAborted) {
        return;
      }
      this._isAborted = true;
      this._reason = reason ?? new AbortError();
      this._events.emit(Events.Abort, this._abortEvent());
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

  class AbortController {
    private readonly _signal = new AbortSignal();

    get signal(): AbortSignal {
      return this._signal;
    }

    abort(reason?: any) {
      this._signal["_abort"](reason);
    }
  }

  return {
    AbortController,
    AbortSignal,
    AbortError,
    TimeoutError,
  };
});
