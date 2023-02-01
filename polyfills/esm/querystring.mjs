// src/polyfills/querystring.ts
var QueryString_default;
((QueryString_default2) => {
  const ArrayIsArray = (v) => Array.isArray(v);
  const MathAbs = (v) => Math.abs(v);
  const NumberIsFinite = (v) => Number.isFinite(v);
  const NumberPrototypeToString = (v, radix) => Number.prototype.toString.call(v, radix);
  const ObjectKeys = (v) => Object.keys(v);
  const StringPrototypeCharCodeAt = (v, i) => String.prototype.charCodeAt.call(v, i);
  const StringPrototypeSlice = (v, start, end) => String.prototype.slice.call(v, start, end);
  const StringPrototypeToUpperCase = (v) => String.prototype.toUpperCase.call(v);
  class ERR_INVALID_URI extends Error {
    constructor() {
      super("URI malformed");
      this.name = "ERR_INVALID_URI";
    }
  }
  const hexTable = new Array(256);
  for (let i = 0; i < 256; ++i)
    hexTable[i] = "%" + StringPrototypeToUpperCase(
      (i < 16 ? "0" : "") + NumberPrototypeToString(i, 16)
    );
  const isHexTable = new Int8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 0 - 15
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 16 - 31
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 32 - 47
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    // 48 - 63
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 64 - 79
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 80 - 95
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 96 - 111
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 112 - 127
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 128 ...
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
    // ... 256
  ]);
  function encodeStr(str, noEscapeTable, hexTable2) {
    const len = str.length;
    if (len === 0)
      return "";
    let out = "";
    let lastPos = 0;
    let i = 0;
    outer:
      for (; i < len; i++) {
        let c = StringPrototypeCharCodeAt(str, i);
        while (c < 128) {
          if (noEscapeTable[c] !== 1) {
            if (lastPos < i)
              out += StringPrototypeSlice(str, lastPos, i);
            lastPos = i + 1;
            out += hexTable2[c];
          }
          if (++i === len)
            break outer;
          c = StringPrototypeCharCodeAt(str, i);
        }
        if (lastPos < i)
          out += StringPrototypeSlice(str, lastPos, i);
        if (c < 2048) {
          lastPos = i + 1;
          out += hexTable2[192 | c >> 6] + hexTable2[128 | c & 63];
          continue;
        }
        if (c < 55296 || c >= 57344) {
          lastPos = i + 1;
          out += hexTable2[224 | c >> 12] + hexTable2[128 | c >> 6 & 63] + hexTable2[128 | c & 63];
          continue;
        }
        ++i;
        if (i >= len)
          throw new ERR_INVALID_URI();
        const c2 = StringPrototypeCharCodeAt(str, i) & 1023;
        lastPos = i + 1;
        c = 65536 + ((c & 1023) << 10 | c2);
        out += hexTable2[240 | c >> 18] + hexTable2[128 | c >> 12 & 63] + hexTable2[128 | c >> 6 & 63] + hexTable2[128 | c & 63];
      }
    if (lastPos === 0)
      return str;
    if (lastPos < len)
      return out + StringPrototypeSlice(str, lastPos);
    return out;
  }
  const unhexTable = new Int8Array([
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 0 - 15
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 16 - 31
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 32 - 47
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 48 - 63
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 64 - 79
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 80 - 95
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 96 - 111
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 112 - 127
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    // 128 ...
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1
    // ... 255
  ]);
  function unescapeBuffer(s, decodeSpaces) {
    const out = Buffer.allocUnsafe(s.length);
    let index = 0;
    let outIndex = 0;
    let currentChar;
    let nextChar;
    let hexHigh;
    let hexLow;
    const maxLength = s.length - 2;
    let hasHex = false;
    while (index < s.length) {
      currentChar = StringPrototypeCharCodeAt(s, index);
      if (currentChar === 43 && decodeSpaces) {
        out[outIndex++] = 32;
        index++;
        continue;
      }
      if (currentChar === 37 && index < maxLength) {
        currentChar = StringPrototypeCharCodeAt(s, ++index);
        hexHigh = unhexTable[currentChar];
        if (!(hexHigh >= 0)) {
          out[outIndex++] = 37;
          continue;
        } else {
          nextChar = StringPrototypeCharCodeAt(s, ++index);
          hexLow = unhexTable[nextChar];
          if (!(hexLow >= 0)) {
            out[outIndex++] = 37;
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
  function unescape2(s, decodeSpaces) {
    try {
      return decodeURIComponent(s);
    } catch {
      return unescapeBuffer(s, decodeSpaces).toString();
    }
  }
  QueryString_default2.unescape = unescape2;
  const noEscape = new Int8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 0 - 15
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    // 16 - 31
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    // 32 - 47
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    // 48 - 63
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    // 64 - 79
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    // 80 - 95
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    // 96 - 111
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    0
    // 112 - 127
  ]);
  function escape2(str) {
    if (typeof str !== "string") {
      if (typeof str === "object")
        str = String(str);
      else
        str += "";
    }
    return encodeStr(str, noEscape, hexTable);
  }
  QueryString_default2.escape = escape2;
  function stringifyPrimitive(v) {
    if (typeof v === "string")
      return v;
    if (typeof v === "bigint")
      return "" + v;
    if (typeof v === "boolean")
      return v ? "true" : "false";
    return "";
  }
  function encodeStringified(v, encode3) {
    if (typeof v === "string")
      return v.length ? encode3(v) : "";
    if (typeof v === "number" && NumberIsFinite(v)) {
      return MathAbs(v) < 1e21 ? "" + v : encode3("" + v);
    }
    if (typeof v === "bigint")
      return "" + v;
    if (typeof v === "boolean")
      return v ? "true" : "false";
    return "";
  }
  function encodeStringifiedCustom(v, encode3) {
    return encode3(stringifyPrimitive(v));
  }
  function stringify2(obj, sep, eq, options) {
    sep = sep || "&";
    eq = eq || "=";
    let encode3 = QueryString_default2.escape;
    if (options && typeof options.encodeURIComponent === "function") {
      encode3 = options.encodeURIComponent;
    }
    const convert = encode3 === QueryString_default2.escape ? encodeStringified : encodeStringifiedCustom;
    if (obj !== null && typeof obj === "object") {
      const keys = ObjectKeys(obj);
      const len = keys.length;
      let fields = "";
      for (let i = 0; i < len; ++i) {
        const k = keys[i];
        const v = obj[k];
        let ks = convert(k, encode3);
        ks += eq;
        if (ArrayIsArray(v)) {
          const vlen = v.length;
          if (vlen === 0)
            continue;
          if (fields)
            fields += sep;
          for (let j = 0; j < vlen; ++j) {
            if (j)
              fields += sep;
            fields += ks;
            fields += convert(v[j], encode3);
          }
        } else {
          if (fields)
            fields += sep;
          fields += ks;
          fields += convert(v, encode3);
        }
      }
      return fields;
    }
    return "";
  }
  QueryString_default2.stringify = stringify2;
  QueryString_default2.encode = stringify2;
  function charCodes(str) {
    if (str.length === 0)
      return [];
    if (str.length === 1)
      return [StringPrototypeCharCodeAt(str, 0)];
    const ret = new Array(str.length);
    for (let i = 0; i < str.length; ++i)
      ret[i] = StringPrototypeCharCodeAt(str, i);
    return ret;
  }
  const defSepCodes = [38];
  const defEqCodes = [61];
  function addKeyVal(obj, key, value, keyEncoded, valEncoded, decode3) {
    if (key.length > 0 && keyEncoded)
      key = decodeStr(key, decode3);
    if (value.length > 0 && valEncoded)
      value = decodeStr(value, decode3);
    if (obj[key] === void 0) {
      obj[key] = value;
    } else {
      const curValue = obj[key];
      if (curValue.pop)
        curValue[curValue.length] = value;
      else
        obj[key] = [curValue, value];
    }
  }
  function parse2(qs, sep, eq, options) {
    const obj = { __proto__: null };
    if (typeof qs !== "string" || qs.length === 0) {
      return obj;
    }
    const sepCodes = !sep ? defSepCodes : charCodes(String(sep));
    const eqCodes = !eq ? defEqCodes : charCodes(String(eq));
    const sepLen = sepCodes.length;
    const eqLen = eqCodes.length;
    let pairs = 1e3;
    if (options && typeof options.maxKeys === "number") {
      pairs = options.maxKeys > 0 ? options.maxKeys : -1;
    }
    let decode3 = QueryString_default2.unescape;
    if (options && typeof options.decodeURIComponent === "function") {
      decode3 = options.decodeURIComponent;
    }
    const customDecode = decode3 !== QueryString_default2.unescape;
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
      if (code === sepCodes[sepIdx]) {
        if (++sepIdx === sepLen) {
          const end = i - sepIdx + 1;
          if (eqIdx < eqLen) {
            if (lastPos < end) {
              key += StringPrototypeSlice(qs, lastPos, end);
            } else if (key.length === 0) {
              if (--pairs === 0)
                return obj;
              lastPos = i + 1;
              sepIdx = eqIdx = 0;
              continue;
            }
          } else if (lastPos < end) {
            value += StringPrototypeSlice(qs, lastPos, end);
          }
          addKeyVal(obj, key, value, keyEncoded, valEncoded, decode3);
          if (--pairs === 0)
            return obj;
          keyEncoded = valEncoded = customDecode;
          key = value = "";
          encodeCheck = 0;
          lastPos = i + 1;
          sepIdx = eqIdx = 0;
        }
      } else {
        sepIdx = 0;
        if (eqIdx < eqLen) {
          if (code === eqCodes[eqIdx]) {
            if (++eqIdx === eqLen) {
              const end = i - eqIdx + 1;
              if (lastPos < end)
                key += StringPrototypeSlice(qs, lastPos, end);
              encodeCheck = 0;
              lastPos = i + 1;
            }
            continue;
          } else {
            eqIdx = 0;
            if (!keyEncoded) {
              if (code === 37) {
                encodeCheck = 1;
                continue;
              } else if (encodeCheck > 0) {
                if (isHexTable[code] === 1) {
                  if (++encodeCheck === 3)
                    keyEncoded = true;
                  continue;
                } else {
                  encodeCheck = 0;
                }
              }
            }
          }
          if (code === 43) {
            if (lastPos < i)
              key += StringPrototypeSlice(qs, lastPos, i);
            key += plusChar;
            lastPos = i + 1;
            continue;
          }
        }
        if (code === 43) {
          if (lastPos < i)
            value += StringPrototypeSlice(qs, lastPos, i);
          value += plusChar;
          lastPos = i + 1;
        } else if (!valEncoded) {
          if (code === 37) {
            encodeCheck = 1;
          } else if (encodeCheck > 0) {
            if (isHexTable[code] === 1) {
              if (++encodeCheck === 3)
                valEncoded = true;
            } else {
              encodeCheck = 0;
            }
          }
        }
      }
    }
    if (lastPos < qs.length) {
      if (eqIdx < eqLen)
        key += StringPrototypeSlice(qs, lastPos);
      else if (sepIdx < sepLen)
        value += StringPrototypeSlice(qs, lastPos);
    } else if (eqIdx === 0 && key.length === 0) {
      return obj;
    }
    addKeyVal(obj, key, value, keyEncoded, valEncoded, decode3);
    return obj;
  }
  QueryString_default2.parse = parse2;
  QueryString_default2.decode = parse2;
  function decodeStr(s, decoder) {
    try {
      return decoder(s);
    } catch {
      return QueryString_default2.unescape(s, true);
    }
  }
})(QueryString_default || (QueryString_default = {}));
var querystring_default = QueryString_default;
var decode = QueryString_default.decode;
var encode = QueryString_default.encode;
var escape = QueryString_default.escape;
var parse = QueryString_default.parse;
var stringify = QueryString_default.stringify;
var unescape = QueryString_default.unescape;
export {
  decode,
  querystring_default as default,
  encode,
  escape,
  parse,
  stringify,
  unescape
};
