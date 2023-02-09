export type EventListener<E = any> =
  | ((ev: E) => void)
  | {
      handleEvent: (ev: E) => void;
    };

export class Event<D extends Record<string, any> = object> {
  static create<D extends Record<string, any>>(data: D) {
    const event = new Event<D>();
    Object.assign(event, data);
    Object.freeze(event);
    return event;
  }
}

export class EventEmitter<
  EventType extends string,
  Ev extends Event<any>,
  Listener extends EventListener = EventListener<Ev>
> {
  private listeners: Map<EventType, Map<Function | object, Listener>> =
    new Map();

  private callListener(listener: Listener, e: Ev) {
    if (typeof listener === "function") listener(e);
    else listener.handleEvent(e);
  }

  add(
    event: EventType,
    listener: Listener,
    options?: boolean | AddEventListenerOptions
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }

    let wrappedListener: Listener = listener;

    if (typeof options === "object") {
      if (options.once) {
        wrappedListener = ((e) => {
          this.remove(event, listener);
          return this.callListener(listener, e);
        }) as Listener;
      }

      if (options.signal) {
        options.signal.addEventListener(
          "abort",
          () => this.remove(event, listener),
          { once: true }
        );
      }
    }

    this.listeners.get(event)!.set(listener, wrappedListener);
  }

  remove(event: EventType, listener: Listener) {
    if (!this.listeners.has(event)) {
      return;
    }
    const listenersMap = this.listeners.get(event)!;
    listenersMap.delete(listener);
  }

  emit(event: EventType, ev: Ev) {
    if (!this.listeners.has(event)) {
      return;
    }
    const listenersMap = this.listeners.get(event)!;

    for (const listener of listenersMap.values()) {
      setTimeout(async () => {
        try {
          await this.callListener(listener, ev);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  clear() {
    this.listeners.clear();
  }
}
