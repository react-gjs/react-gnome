/* eslint-disable @typescript-eslint/restrict-plus-operands */
/**
 * Stolen from:
 * https://github.com/nodejs/node/blob/main/lib/querystring.js
 *
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

namespace QueryString_default {
  const ArrayIsArray = (v: any): v is any[] => Array.isArray(v);
  const MathAbs = (v: number) => Math.abs(v);
  const NumberIsFinite = (v: number) => Number.isFinite(v);
  const NumberPrototypeToString = (v: number, radix?: number) =>
    Number.prototype.toString.call(v, radix);
  const ObjectKeys = (v: object) => Object.keys(v);
  const StringPrototypeCharCodeAt = (v: string, i: number) =>
    String.prototype.charCodeAt.call(v, i);
  const StringPrototypeSlice = (v: string, start?: number, end?: number) =>
    String.prototype.slice.call(v, start, end);
  const StringPrototypeToUpperCase = (v: string) =>
    String.prototype.toUpperCase.call(v);

  // #region internals

  class ERR_INVALID_URI extends Error {
    constructor() {
      super("URI malformed");
      this.name = "ERR_INVALID_URI";
    }
  }

  const hexTable = new Array(256);
  for (let i = 0; i < 256; ++i)
    hexTable[i] =
      "%" +
      StringPrototypeToUpperCase(
        (i < 16 ? "0" : "") + NumberPrototypeToString(i, 16)
      );

  // prettier-ignore
  const isHexTable = new Int8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 32 - 47
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
    0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 64 - 79
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 80 - 95
    0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 96 - 111
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 112 - 127
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 128 ...
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  // ... 256
  ]);

  function encodeStr(
    str: string,
    noEscapeTable: Int8Array,
    hexTable: string[]
  ): string {
    const len = str.length;
    if (len === 0) return "";

    let out = "";
    let lastPos = 0;
    let i = 0;

    outer: for (; i < len; i++) {
      let c = StringPrototypeCharCodeAt(str, i);

      // ASCII
      while (c < 0x80) {
        if (noEscapeTable[c] !== 1) {
          if (lastPos < i) out += StringPrototypeSlice(str, lastPos, i);
          lastPos = i + 1;
          out += hexTable[c];
        }

        if (++i === len) break outer;

        c = StringPrototypeCharCodeAt(str, i);
      }

      if (lastPos < i) out += StringPrototypeSlice(str, lastPos, i);

      // Multi-byte characters ...
      if (c < 0x800) {
        lastPos = i + 1;
        out += hexTable[0xc0 | (c >> 6)]! + hexTable[0x80 | (c & 0x3f)]!;
        continue;
      }
      if (c < 0xd800 || c >= 0xe000) {
        lastPos = i + 1;
        out +=
          hexTable[0xe0 | (c >> 12)]! +
          hexTable[0x80 | ((c >> 6) & 0x3f)]! +
          hexTable[0x80 | (c & 0x3f)]!;
        continue;
      }
      // Surrogate pair
      ++i;

      // This branch should never happen because all URLSearchParams entries
      // should already be converted to USVString. But, included for
      // completion's sake anyway.
      if (i >= len) throw new ERR_INVALID_URI();

      const c2 = StringPrototypeCharCodeAt(str, i) & 0x3ff;

      lastPos = i + 1;
      c = 0x10000 + (((c & 0x3ff) << 10) | c2);
      out +=
        hexTable[0xf0 | (c >> 18)]! +
        hexTable[0x80 | ((c >> 12) & 0x3f)]! +
        hexTable[0x80 | ((c >> 6) & 0x3f)]! +
        hexTable[0x80 | (c & 0x3f)]!;
    }
    if (lastPos === 0) return str;
    if (lastPos < len) return out + StringPrototypeSlice(str, lastPos);
    return out;
  }

  // #endregion

  // prettier-ignore
  const unhexTable = new Int8Array([
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 0 - 15
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 16 - 31
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 32 - 47
    +0, +1, +2, +3, +4, +5, +6, +7, +8, +9, -1, -1, -1, -1, -1, -1, // 48 - 63
    -1, 10, 11, 12, 13, 14, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 64 - 79
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 80 - 95
    -1, 10, 11, 12, 13, 14, 15, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 96 - 111
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 112 - 127
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 128 ...
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  // ... 255
  ]);

  function unescapeBuffer(s: string, decodeSpaces?: boolean): Buffer {
    const out = Buffer.allocUnsafe(s.length);
    let index = 0;
    let outIndex = 0;
    let currentChar: number;
    let nextChar: number;
    let hexHigh: number;
    let hexLow: number;
    const maxLength = s.length - 2;
    // Flag to know if some hex chars have been decoded
    let hasHex = false;
    while (index < s.length) {
      currentChar = StringPrototypeCharCodeAt(s, index);
      if (currentChar === 43 /* '+' */ && decodeSpaces) {
        out[outIndex++] = 32; // ' '
        index++;
        continue;
      }
      if (currentChar === 37 /* '%' */ && index < maxLength) {
        currentChar = StringPrototypeCharCodeAt(s, ++index);
        hexHigh = unhexTable[currentChar]!;
        if (!(hexHigh >= 0)) {
          out[outIndex++] = 37; // '%'
          continue;
        } else {
          nextChar = StringPrototypeCharCodeAt(s, ++index);
          hexLow = unhexTable[nextChar]!;
          if (!(hexLow >= 0)) {
            out[outIndex++] = 37; // '%'
            index--;
          } else {
            hasHex = true;
            currentChar = hexHigh * 16 + hexLow;
          }
        }
      }
      out[outIndex++] = currentChar;
      index++;
    }
    return hasHex ? out.slice(0, outIndex) : out;
  }

  export function unescape(s: string, decodeSpaces?: boolean): string {
    try {
      return decodeURIComponent(s);
    } catch {
      return unescapeBuffer(s, decodeSpaces).toString();
    }
  }

  // These characters do not need escaping when generating query strings:
  // ! - . _ ~
  // ' ( ) *
  // digits
  // alpha (uppercase)
  // alpha (lowercase)
  // prettier-ignore
  const noEscape = new Int8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
    0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, // 32 - 47
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, // 80 - 95
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0,  // 112 - 127
  ]);

  /**
   * QueryString.escape() replaces encodeURIComponent()
   *
   * @see https://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3.4
   */
  export function escape(str: any): string {
    if (typeof str !== "string") {
      if (typeof str === "object") str = String(str);
      else str += "";
    }

    return encodeStr(str, noEscape, hexTable);
  }

  function stringifyPrimitive(
    v: string | number | bigint | boolean | symbol | undefined | null
  ): string {
    if (typeof v === "string") return v;
    if (typeof v === "bigint") return "" + v;
    if (typeof v === "boolean") return v ? "true" : "false";
    return "";
  }

  function encodeStringified(
    v: string | number | bigint | boolean,
    encode: (v: string) => string
  ): string {
    if (typeof v === "string") return v.length ? encode(v) : "";
    if (typeof v === "number" && NumberIsFinite(v)) {
      // Values >= 1e21 automatically switch to scientific notation
      // which requires escaping due to the inclusion of a '+' in the output
      return MathAbs(v) < 1e21 ? "" + v : encode("" + v);
    }
    if (typeof v === "bigint") return "" + v;
    if (typeof v === "boolean") return v ? "true" : "false";
    return "";
  }

  function encodeStringifiedCustom(
    v: string | number | boolean | null,
    encode: (v: string) => string
  ): string {
    return encode(stringifyPrimitive(v));
  }

  export function stringify(
    obj: Record<
      string,
      | string
      | number
      | boolean
      | ReadonlyArray<string | number | boolean>
      | null
    >,
    sep: string,
    eq: string,
    options: { encodeURIComponent?: (v: string) => string }
  ): string {
    sep = sep || "&";
    eq = eq || "=";

    let encode = QueryString_default.escape;
    if (options && typeof options.encodeURIComponent === "function") {
      encode = options.encodeURIComponent;
    }
    const convert =
      encode === QueryString_default.escape
        ? encodeStringified
        : encodeStringifiedCustom;

    if (obj !== null && typeof obj === "object") {
      const keys = ObjectKeys(obj);
      const len = keys.length;
      let fields = "";
      for (let i = 0; i < len; ++i) {
        const k = keys[i]!;
        const v = obj[k]!;
        let ks = convert(k, encode);
        ks += eq;

        if (ArrayIsArray(v)) {
          const vlen = v.length;
          if (vlen === 0) continue;
          if (fields) fields += sep;
          for (let j = 0; j < vlen; ++j) {
            if (j) fields += sep;
            fields += ks;
            fields += convert(v[j], encode);
          }
        } else {
          if (fields) fields += sep;
          fields += ks;
          fields += convert(v as string, encode);
        }
      }
      return fields;
    }
    return "";
  }

  export const encode = stringify;

  function charCodes(str: string): number[] {
    if (str.length === 0) return [];
    if (str.length === 1) return [StringPrototypeCharCodeAt(str, 0)];
    const ret = new Array(str.length);
    for (let i = 0; i < str.length; ++i)
      ret[i] = StringPrototypeCharCodeAt(str, i);
    return ret;
  }

  const defSepCodes = [38]; // &
  const defEqCodes = [61]; // =

  function addKeyVal(
    obj: Record<string, string | string[]>,
    key: string,
    value: string,
    keyEncoded: boolean,
    valEncoded: boolean,
    decode: (v: string) => string
  ) {
    if (key.length > 0 && keyEncoded) key = decodeStr(key, decode);
    if (value.length > 0 && valEncoded) value = decodeStr(value, decode);

    if (obj[key] === undefined) {
      obj[key] = value;
    } else {
      const curValue = obj[key]!;
      // A simple Array-specific property check is enough here to
      // distinguish from a string value and is faster and still safe
      // since we are generating all of the values being assigned.
      if ((curValue as string[]).pop)
        (curValue as string[])[curValue.length] = value;
      else obj[key] = [curValue as string, value];
    }
  }

  /** Parse a key/val string. */
  export function parse(
    qs: string,
    sep: string,
    eq: string,
    options: {
      maxKeys?: number;
      decodeURIComponent?(v: string): string;
    }
  ): Record<string, string | string[]> {
    const obj = { __proto__: null } as any as Record<string, string | string[]>;

    if (typeof qs !== "string" || qs.length === 0) {
      return obj;
    }

    const sepCodes = !sep ? defSepCodes : charCodes(String(sep));
    const eqCodes = !eq ? defEqCodes : charCodes(String(eq));
    const sepLen = sepCodes.length;
    const eqLen = eqCodes.length;

    let pairs = 1000;
    if (options && typeof options.maxKeys === "number") {
      // -1 is used in place of a value like Infinity for meaning
      // "unlimited pairs" because of additional checks V8 (at least as of v5.4)
      // has to do when using variables that contain values like Infinity. Since
      // `pairs` is always decremented and checked explicitly for 0, -1 works
      // effectively the same as Infinity, while providing a significant
      // performance boost.
      pairs = options.maxKeys > 0 ? options.maxKeys : -1;
    }

    let decode = QueryString_default.unescape;
    if (options && typeof options.decodeURIComponent === "function") {
      decode = options.decodeURIComponent;
    }
    const customDecode = decode !== QueryString_default.unescape;

    let lastPos = 0;
    let sepIdx = 0;
    let eqIdx = 0;
    let key = "";
    let value = "";
    let keyEncoded = customDecode;
    let valEncoded = customDecode;
    const plusChar = customDecode ? "%20" : " ";
    let encodeCheck = 0;
    for (let i = 0; i < qs.length; ++i) {
      const code = StringPrototypeCharCodeAt(qs, i);

      // Try matching key/value pair separator (e.g. '&')
      if (code === sepCodes[sepIdx]) {
        if (++sepIdx === sepLen) {
          // Key/value pair separator match!
          const end = i - sepIdx + 1;
          if (eqIdx < eqLen) {
            // We didn't find the (entire) key/value separator
            if (lastPos < end) {
              // Treat the substring as part of the key instead of the value
              key += StringPrototypeSlice(qs, lastPos, end);
            } else if (key.length === 0) {
              // We saw an empty substring between separators
              if (--pairs === 0) return obj;
              lastPos = i + 1;
              sepIdx = eqIdx = 0;
              continue;
            }
          } else if (lastPos < end) {
            value += StringPrototypeSlice(qs, lastPos, end);
          }

          addKeyVal(obj, key, value, keyEncoded, valEncoded, decode);

          if (--pairs === 0) return obj;
          keyEncoded = valEncoded = customDecode;
          key = value = "";
          encodeCheck = 0;
          lastPos = i + 1;
          sepIdx = eqIdx = 0;
        }
      } else {
        sepIdx = 0;
        // Try matching key/value separator (e.g. '=') if we haven't already
        if (eqIdx < eqLen) {
          if (code === eqCodes[eqIdx]) {
            if (++eqIdx === eqLen) {
              // Key/value separator match!
              const end = i - eqIdx + 1;
              if (lastPos < end) key += StringPrototypeSlice(qs, lastPos, end);
              encodeCheck = 0;
              lastPos = i + 1;
            }
            continue;
          } else {
            eqIdx = 0;
            if (!keyEncoded) {
              // Try to match an (valid) encoded byte once to minimize
              // unnecessary calls to string decoding functions
              if (code === 37 /* % */) {
                encodeCheck = 1;
                continue;
              } else if (encodeCheck > 0) {
                if (isHexTable[code] === 1) {
                  if (++encodeCheck === 3) keyEncoded = true;
                  continue;
                } else {
                  encodeCheck = 0;
                }
              }
            }
          }
          if (code === 43 /* + */) {
            if (lastPos < i) key += StringPrototypeSlice(qs, lastPos, i);
            key += plusChar;
            lastPos = i + 1;
            continue;
          }
        }
        if (code === 43 /* + */) {
          if (lastPos < i) value += StringPrototypeSlice(qs, lastPos, i);
          value += plusChar;
          lastPos = i + 1;
        } else if (!valEncoded) {
          // Try to match an (valid) encoded byte (once) to minimize unnecessary
          // calls to string decoding functions
          if (code === 37 /* % */) {
            encodeCheck = 1;
          } else if (encodeCheck > 0) {
            if (isHexTable[code] === 1) {
              if (++encodeCheck === 3) valEncoded = true;
            } else {
              encodeCheck = 0;
            }
          }
        }
      }
    }

    // Deal with any leftover key or value data
    if (lastPos < qs.length) {
      if (eqIdx < eqLen) key += StringPrototypeSlice(qs, lastPos);
      else if (sepIdx < sepLen) value += StringPrototypeSlice(qs, lastPos);
    } else if (eqIdx === 0 && key.length === 0) {
      // We ended on an empty substring
      return obj;
    }

    addKeyVal(obj, key, value, keyEncoded, valEncoded, decode);

    return obj;
  }

  export const decode = parse;

  /**
   * V8 does not optimize functions with try-catch blocks, so we
   * isolate them here to minimize the damage (Note: no longer
   * true as of V8 5.4 -- but still will not be inlined).
   */
  function decodeStr(s: string, decoder: (v: string) => string): string {
    try {
      return decoder(s);
    } catch {
      return QueryString_default.unescape(s, true);
    }
  }
}

export default QueryString_default;

export const decode = QueryString_default.decode;
export const encode = QueryString_default.encode;
export const escape = QueryString_default.escape;
export const parse = QueryString_default.parse;
export const stringify = QueryString_default.stringify;
export const unescape = QueryString_default.unescape;
