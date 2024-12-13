// src/runtime/helpers/base64-vlq.ts
var Base64VLQ = class {
  charToInteger = /* @__PURE__ */ new Map();
  integerToChar = /* @__PURE__ */ new Map();
  constructor() {
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("").forEach((char, i) => {
      this.charToInteger.set(char, i);
      this.integerToChar.set(i, char);
    });
  }
  decode(string) {
    const result = [];
    let shift = 0;
    let value = 0;
    for (let i = 0; i < string.length; i += 1) {
      const char = string[i];
      let integer = this.charToInteger.get(char);
      if (integer === void 0) {
        throw new Error(`Invalid character (${string[i]})`);
      }
      const has_continuation_bit = integer & 32;
      integer &= 31;
      value += integer << shift;
      if (has_continuation_bit) {
        shift += 5;
      } else {
        const should_negate = value & 1;
        value >>>= 1;
        if (should_negate) {
          result.push(value === 0 ? -2147483648 : -value);
        } else {
          result.push(value);
        }
        value = shift = 0;
      }
    }
    return result;
  }
  encode(value) {
    if (typeof value === "number") {
      return this.encodeInteger(value);
    }
    let result = "";
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i];
      result += this.encodeInteger(char);
    }
    return result;
  }
  encodeInteger(num) {
    let result = "";
    if (num < 0) {
      num = -num << 1 | 1;
    } else {
      num <<= 1;
    }
    do {
      let clamped = num & 31;
      num >>>= 5;
      if (num > 0) {
        clamped |= 32;
      }
      result += this.integerToChar.get(clamped);
    } while (num > 0);
    return result;
  }
};
export {
  Base64VLQ
};
