type FormDataEntryValueP = string;

class FormData {
  private _entries: Map<string, FormDataEntryValueP[]> = new Map();

  append(name: string, value: FormDataEntryValueP): void {
    if (this._entries.has(name)) {
      this._entries.get(name)!.push(value);
    } else {
      this._entries.set(name, [value]);
    }
  }

  delete(name: string): void {
    this._entries.delete(name);
  }

  get(name: string): FormDataEntryValueP | null {
    const entry = this._entries.get(name);
    return entry && entry[0] ? entry[0] : null;
  }

  getAll(name: string): FormDataEntryValueP[] {
    const entry = this._entries.get(name);
    return entry ? entry : [];
  }

  has(name: string): boolean {
    return this._entries.has(name);
  }

  set(name: string, value: FormDataEntryValueP): void {
    this._entries.set(name, [value]);
  }

  forEach(
    callbackfn: (
      value: FormDataEntryValueP,
      key: string,
      parent: FormData
    ) => void
  ): void {
    this._entries.forEach((value, key) => {
      value.forEach((value) => {
        callbackfn(value, key, this);
      });
    });
  }

  /**
   * Returns an array of key, value pairs for every entry in the
   * list.
   */
  entries(): IterableIterator<[string, FormDataEntryValueP]> {
    const entries = this._entries;

    const generator = function* (): Generator<[string, string]> {
      for (const [key, value] of entries) {
        for (const v of value) {
          yield [key, v];
        }
      }
    };

    return generator();
  }

  /** Returns a list of keys in the list. */
  keys(): IterableIterator<string> {
    return this._entries.keys();
  }

  /** Returns a list of values in the list. */
  values(): IterableIterator<FormDataEntryValueP> {
    const entries = this._entries;

    const generator = function* (): Generator<string> {
      for (const [, value] of entries) {
        for (const v of value) {
          yield v;
        }
      }
    };

    return generator();
  }

  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValueP]> {
    return this.entries();
  }
}

export { FormData };
