// src/polyfills/shared/event-emitter.ts
var Event = class _Event {
  static create(data) {
    const event = new _Event();
    Object.assign(event, data);
    Object.freeze(event);
    return event;
  }
};
var EventEmitter = class {
  listeners = /* @__PURE__ */ new Map();
  callListener(listener, e) {
    if (typeof listener === "function")
      listener(e);
    else
      listener.handleEvent(e);
  }
  add(event, listener, options) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Map());
    }
    let wrappedListener = listener;
    if (typeof options === "object") {
      if (options.once) {
        wrappedListener = (e) => {
          this.remove(event, listener);
          return this.callListener(listener, e);
        };
      }
      if (options.signal) {
        options.signal.addEventListener(
          "abort",
          () => this.remove(event, listener),
          { once: true }
        );
      }
    }
    this.listeners.get(event).set(listener, wrappedListener);
  }
  remove(event, listener) {
    if (!this.listeners.has(event)) {
      return;
    }
    const listenersMap = this.listeners.get(event);
    listenersMap.delete(listener);
  }
  emit(event, ev) {
    if (!this.listeners.has(event)) {
      return;
    }
    const listenersMap = this.listeners.get(event);
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
};
export {
  Event,
  EventEmitter
};
