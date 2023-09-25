// src/polyfills/form-data.ts
import { registerPolyfills } from "./shared/polyfill-global.mjs";
registerPolyfills("FormData")(() => {
  class FormData {
    _entries = /* @__PURE__ */ new Map();
    append(name, value) {
      if (this._entries.has(name)) {
        this._entries.get(name).push(value);
      } else {
        this._entries.set(name, [value]);
      }
    }
    delete(name) {
      this._entries.delete(name);
    }
    get(name) {
      const entry = this._entries.get(name);
      return entry && entry[0] ? entry[0] : null;
    }
    getAll(name) {
      const entry = this._entries.get(name);
      return entry ? entry : [];
    }
    has(name) {
      return this._entries.has(name);
    }
    set(name, value) {
      this._entries.set(name, [value]);
    }
    forEach(callbackfn) {
      this._entries.forEach((value, key) => {
        value.forEach((value2) => {
          callbackfn(value2, key, this);
        });
      });
    }
    /**
     * Returns an array of key, value pairs for every entry in the list.
     */
    entries() {
      const entries = this._entries;
      const generator = function* () {
        for (const [key, value] of entries) {
          for (const v of value) {
            yield [key, v];
          }
        }
      };
      return generator();
    }
    /**
     * Returns a list of keys in the list.
     */
    keys() {
      return this._entries.keys();
    }
    /**
     * Returns a list of values in the list.
     */
    values() {
      const entries = this._entries;
      const generator = function* () {
        for (const [, value] of entries) {
          for (const v of value) {
            yield v;
          }
        }
      };
      return generator();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  }
  return {
    FormData
  };
});
