// src/polyfills/url.ts
import { registerPolyfills } from "./shared/polyfill-global.mjs";
registerPolyfills(
  "URL",
  "URLSearchParams"
)(() => {
  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true });
  function utf8Encode(str) {
    return utf8Encoder.encode(str);
  }
  function utf8DecodeWithoutBOM(bytes) {
    return utf8Decoder.decode(bytes);
  }
  function isASCIIDigit(c) {
    return c >= 48 && c <= 57;
  }
  function isASCIIAlpha(c) {
    return c >= 65 && c <= 90 || c >= 97 && c <= 122;
  }
  function isASCIIAlphanumeric(c) {
    return isASCIIAlpha(c) || isASCIIDigit(c);
  }
  function isASCIIHex(c) {
    return isASCIIDigit(c) || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  function p(char) {
    return char.codePointAt(0);
  }
  function percentEncode(c) {
    let hex = c.toString(16).toUpperCase();
    if (hex.length === 1) {
      hex = `0${hex}`;
    }
    return `%${hex}`;
  }
  function percentDecodeBytes(input) {
    const output = new Uint8Array(input.byteLength);
    let outputIndex = 0;
    for (let i = 0; i < input.byteLength; ++i) {
      const byte = input[i];
      if (byte !== 37) {
        output[outputIndex++] = byte;
      } else if (byte === 37 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
        output[outputIndex++] = byte;
      } else {
        const bytePoint = parseInt(
          String.fromCodePoint(input[i + 1], input[i + 2]),
          16
        );
        output[outputIndex++] = bytePoint;
        i += 2;
      }
    }
    return output.slice(0, outputIndex);
  }
  function percentDecodeString(input) {
    const bytes = utf8Encode(input);
    return percentDecodeBytes(bytes);
  }
  function isC0ControlPercentEncode(c) {
    return c <= 31 || c > 126;
  }
  const extraFragmentPercentEncodeSet = /* @__PURE__ */ new Set([
    p(" "),
    p('"'),
    p("<"),
    p(">"),
    p("`")
  ]);
  function isFragmentPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
  }
  const extraQueryPercentEncodeSet = /* @__PURE__ */ new Set([
    p(" "),
    p('"'),
    p("#"),
    p("<"),
    p(">")
  ]);
  function isQueryPercentEncode(c) {
    return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.has(c);
  }
  function isSpecialQueryPercentEncode(c) {
    return isQueryPercentEncode(c) || c === p("'");
  }
  const extraPathPercentEncodeSet = /* @__PURE__ */ new Set([p("?"), p("`"), p("{"), p("}")]);
  function isPathPercentEncode(c) {
    return isQueryPercentEncode(c) || extraPathPercentEncodeSet.has(c);
  }
  const extraUserinfoPercentEncodeSet = /* @__PURE__ */ new Set([
    p("/"),
    p(":"),
    p(";"),
    p("="),
    p("@"),
    p("["),
    p("\\"),
    p("]"),
    p("^"),
    p("|")
  ]);
  function isUserinfoPercentEncode(c) {
    return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
  }
  const extraComponentPercentEncodeSet = /* @__PURE__ */ new Set([
    p("$"),
    p("%"),
    p("&"),
    p("+"),
    p(",")
  ]);
  function isComponentPercentEncode(c) {
    return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.has(c);
  }
  const extraURLEncodedPercentEncodeSet = /* @__PURE__ */ new Set([
    p("!"),
    p("'"),
    p("("),
    p(")"),
    p("~")
  ]);
  function isURLEncodedPercentEncode(c) {
    return isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.has(c);
  }
  function utf8PercentEncodeCodePointInternal(codePoint, percentEncodePredicate) {
    const bytes = utf8Encode(codePoint);
    let output = "";
    for (const byte of bytes) {
      if (!percentEncodePredicate(byte)) {
        output += String.fromCharCode(byte);
      } else {
        output += percentEncode(byte);
      }
    }
    return output;
  }
  function utf8PercentEncodeCodePoint(codePoint, percentEncodePredicate) {
    return utf8PercentEncodeCodePointInternal(
      String.fromCodePoint(codePoint),
      percentEncodePredicate
    );
  }
  function utf8PercentEncodeString(input, percentEncodePredicate, spaceAsPlus = false) {
    let output = "";
    for (const codePoint of input) {
      if (spaceAsPlus && codePoint === " ") {
        output += "+";
      } else {
        output += utf8PercentEncodeCodePointInternal(
          codePoint,
          percentEncodePredicate
        );
      }
    }
    return output;
  }
  function parseUrlencoded(input) {
    const sequences = strictlySplitByteSequence(input, p("&"));
    const output = [];
    for (const bytes of sequences) {
      if (bytes.length === 0) {
        continue;
      }
      let name, value;
      const indexOfEqual = bytes.indexOf(p("="));
      if (indexOfEqual >= 0) {
        name = bytes.slice(0, indexOfEqual);
        value = bytes.slice(indexOfEqual + 1);
      } else {
        name = bytes;
        value = new Uint8Array(0);
      }
      name = replaceByteInByteSequence(name, 43, 32);
      value = replaceByteInByteSequence(value, 43, 32);
      const nameString = utf8DecodeWithoutBOM(percentDecodeBytes(name));
      const valueString = utf8DecodeWithoutBOM(percentDecodeBytes(value));
      output.push([nameString, valueString]);
    }
    return output;
  }
  function parseUrlencodedString(input) {
    return parseUrlencoded(utf8Encode(input));
  }
  function serializeUrlencoded(tuples, encodingOverride = void 0) {
    let encoding = "utf-8";
    if (encodingOverride !== void 0) {
      encoding = encodingOverride;
    }
    let output = "";
    for (const [i, tuple] of tuples.entries()) {
      const name = utf8PercentEncodeString(
        tuple[0],
        isURLEncodedPercentEncode,
        true
      );
      let value = tuple[1];
      if (tuple.length > 2 && tuple[2] !== void 0) {
        if (tuple[2] === "hidden" && name === "_charset_") {
          value = encoding;
        } else if (tuple[2] === "file") {
          value = value.name;
        }
      }
      value = utf8PercentEncodeString(value, isURLEncodedPercentEncode, true);
      if (i !== 0) {
        output += "&";
      }
      output += `${name}=${value}`;
    }
    return output;
  }
  function strictlySplitByteSequence(buf, cp) {
    const list = [];
    let last = 0;
    let i = buf.indexOf(cp);
    while (i >= 0) {
      list.push(buf.slice(last, i));
      last = i + 1;
      i = buf.indexOf(cp, last);
    }
    if (last !== buf.length) {
      list.push(buf.slice(last));
    }
    return list;
  }
  function replaceByteInByteSequence(buf, from, to) {
    let i = buf.indexOf(from);
    while (i >= 0) {
      buf[i] = to;
      i = buf.indexOf(from, i + 1);
    }
    return buf;
  }
  const specialSchemes = {
    ftp: 21,
    file: null,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
  };
  const failure = Symbol("failure");
  function countSymbols(str) {
    return [...str].length;
  }
  function at(input, idx) {
    const c = input[idx];
    return isNaN(c) ? void 0 : String.fromCodePoint(c);
  }
  function isSingleDot(buffer) {
    return buffer === "." || buffer.toLowerCase() === "%2e";
  }
  function isDoubleDot(buffer) {
    buffer = buffer.toLowerCase();
    return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
  }
  function isWindowsDriveLetterCodePoints(cp1, cp2) {
    return isASCIIAlpha(cp1) && (cp2 === p(":") || cp2 === p("|"));
  }
  function isWindowsDriveLetterString(str) {
    return str.length === 2 && isASCIIAlpha(str.codePointAt(0)) && (str[1] === ":" || str[1] === "|");
  }
  function isNormalizedWindowsDriveLetterString(str) {
    return str.length === 2 && isASCIIAlpha(str.codePointAt(0)) && str[1] === ":";
  }
  function containsForbiddenHostCodePoint(str) {
    return str.search(
      /\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u
    ) !== -1;
  }
  function containsForbiddenHostCodePointExcludingPercent(str) {
    return str.search(
      /\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u
    ) !== -1;
  }
  function isSpecialScheme(scheme) {
    return specialSchemes[scheme] !== void 0;
  }
  function isSpecial(url) {
    return isSpecialScheme(url.scheme);
  }
  function isNotSpecial(url) {
    return !isSpecialScheme(url.scheme);
  }
  function defaultPort(scheme) {
    return specialSchemes[scheme];
  }
  function parseIPv4Number(input) {
    if (input === "") {
      return failure;
    }
    let R = 10;
    if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
      input = input.substring(2);
      R = 16;
    } else if (input.length >= 2 && input.charAt(0) === "0") {
      input = input.substring(1);
      R = 8;
    }
    if (input === "") {
      return 0;
    }
    let regex = /[^0-7]/u;
    if (R === 10) {
      regex = /[^0-9]/u;
    }
    if (R === 16) {
      regex = /[^0-9A-Fa-f]/u;
    }
    if (regex.test(input)) {
      return failure;
    }
    return parseInt(input, R);
  }
  function parseIPv4(input) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
      if (parts.length > 1) {
        parts.pop();
      }
    }
    if (parts.length > 4) {
      return failure;
    }
    const numbers = [];
    for (const part of parts) {
      const n = parseIPv4Number(part);
      if (n === failure) {
        return failure;
      }
      numbers.push(n);
    }
    for (let i = 0; i < numbers.length - 1; ++i) {
      if (numbers[i] > 255) {
        return failure;
      }
    }
    if (numbers[numbers.length - 1] >= 256 ** (5 - numbers.length)) {
      return failure;
    }
    let ipv4 = numbers.pop();
    let counter = 0;
    for (const n of numbers) {
      ipv4 += n * 256 ** (3 - counter);
      ++counter;
    }
    return ipv4;
  }
  function serializeIPv4(address) {
    let output = "";
    let n = address;
    for (let i = 1; i <= 4; ++i) {
      output = String(n % 256) + output;
      if (i !== 4) {
        output = `.${output}`;
      }
      n = Math.floor(n / 256);
    }
    return output;
  }
  function parseIPv6(inputStr) {
    const address = [0, 0, 0, 0, 0, 0, 0, 0];
    let pieceIndex = 0;
    let compress = null;
    let pointer = 0;
    const input = Array.from(inputStr, (c) => c.codePointAt(0));
    if (input[pointer] === p(":")) {
      if (input[pointer + 1] !== p(":")) {
        return failure;
      }
      pointer += 2;
      ++pieceIndex;
      compress = pieceIndex;
    }
    while (pointer < input.length) {
      if (pieceIndex === 8) {
        return failure;
      }
      if (input[pointer] === p(":")) {
        if (compress !== null) {
          return failure;
        }
        ++pointer;
        ++pieceIndex;
        compress = pieceIndex;
        continue;
      }
      let value = 0;
      let length = 0;
      while (length < 4 && isASCIIHex(input[pointer])) {
        value = value * 16 + parseInt(at(input, pointer), 16);
        ++pointer;
        ++length;
      }
      if (input[pointer] === p(".")) {
        if (length === 0) {
          return failure;
        }
        pointer -= length;
        if (pieceIndex > 6) {
          return failure;
        }
        let numbersSeen = 0;
        while (input[pointer] !== void 0) {
          let ipv4Piece = null;
          if (numbersSeen > 0) {
            if (input[pointer] === p(".") && numbersSeen < 4) {
              ++pointer;
            } else {
              return failure;
            }
          }
          if (!isASCIIDigit(input[pointer])) {
            return failure;
          }
          while (isASCIIDigit(input[pointer])) {
            const number = parseInt(at(input, pointer));
            if (ipv4Piece === null) {
              ipv4Piece = number;
            } else if (ipv4Piece === 0) {
              return failure;
            } else {
              ipv4Piece = ipv4Piece * 10 + number;
            }
            if (ipv4Piece > 255) {
              return failure;
            }
            ++pointer;
          }
          address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
          ++numbersSeen;
          if (numbersSeen === 2 || numbersSeen === 4) {
            ++pieceIndex;
          }
        }
        if (numbersSeen !== 4) {
          return failure;
        }
        break;
      } else if (input[pointer] === p(":")) {
        ++pointer;
        if (input[pointer] === void 0) {
          return failure;
        }
      } else if (input[pointer] !== void 0) {
        return failure;
      }
      address[pieceIndex] = value;
      ++pieceIndex;
    }
    if (compress !== null) {
      let swaps = pieceIndex - compress;
      pieceIndex = 7;
      while (pieceIndex !== 0 && swaps > 0) {
        const temp = address[compress + swaps - 1];
        address[compress + swaps - 1] = address[pieceIndex];
        address[pieceIndex] = temp;
        --pieceIndex;
        --swaps;
      }
    } else if (compress === null && pieceIndex !== 8) {
      return failure;
    }
    return address;
  }
  function serializeIPv6(address) {
    let output = "";
    const compress = findLongestZeroSequence(address);
    let ignore0 = false;
    for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
      if (ignore0 && address[pieceIndex] === 0) {
        continue;
      } else if (ignore0) {
        ignore0 = false;
      }
      if (compress === pieceIndex) {
        const separator = pieceIndex === 0 ? "::" : ":";
        output += separator;
        ignore0 = true;
        continue;
      }
      output += address[pieceIndex].toString(16);
      if (pieceIndex !== 7) {
        output += ":";
      }
    }
    return output;
  }
  function parseHost(input, isNotSpecialArg = false) {
    if (input[0] === "[") {
      if (input[input.length - 1] !== "]") {
        return failure;
      }
      return parseIPv6(input.substring(1, input.length - 1));
    }
    if (isNotSpecialArg) {
      return parseOpaqueHost(input);
    }
    const domain = utf8DecodeWithoutBOM(percentDecodeString(input));
    const asciiDomain = domainToASCII(domain);
    if (asciiDomain === failure) {
      return failure;
    }
    if (containsForbiddenHostCodePoint(asciiDomain)) {
      return failure;
    }
    if (endsInANumber(asciiDomain)) {
      return parseIPv4(asciiDomain);
    }
    return asciiDomain;
  }
  function endsInANumber(input) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
      if (parts.length === 1) {
        return false;
      }
      parts.pop();
    }
    const last = parts[parts.length - 1];
    if (parseIPv4Number(last) !== failure) {
      return true;
    }
    if (/^[0-9]+$/u.test(last)) {
      return true;
    }
    return false;
  }
  function parseOpaqueHost(input) {
    if (containsForbiddenHostCodePointExcludingPercent(input)) {
      return failure;
    }
    return utf8PercentEncodeString(input, isC0ControlPercentEncode);
  }
  function findLongestZeroSequence(arr) {
    let maxIdx = null;
    let maxLen = 1;
    let currStart = null;
    let currLen = 0;
    for (let i = 0; i < arr.length; ++i) {
      if (arr[i] !== 0) {
        if (currLen > maxLen) {
          maxIdx = currStart;
          maxLen = currLen;
        }
        currStart = null;
        currLen = 0;
      } else {
        if (currStart === null) {
          currStart = i;
        }
        ++currLen;
      }
    }
    if (currLen > maxLen) {
      return currStart;
    }
    return maxIdx;
  }
  function serializeHost(host) {
    if (typeof host === "number") {
      return serializeIPv4(host);
    }
    if (host instanceof Array) {
      return `[${serializeIPv6(host)}]`;
    }
    return host;
  }
  function domainToASCII(domain) {
    const result = domain;
    if (result === null || result === "") {
      return failure;
    }
    return result;
  }
  function trimControlChars(url) {
    return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/gu, "");
  }
  function trimTabAndNewline(url) {
    return url.replace(/\u0009|\u000A|\u000D/gu, "");
  }
  function shortenPath(url) {
    const { path } = url;
    if (path.length === 0) {
      return;
    }
    if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
      return;
    }
    path.pop();
  }
  function includesCredentials(url) {
    return url.username !== "" || url.password !== "";
  }
  function cannotHaveAUsernamePasswordPort(url) {
    return url.host === null || url.host === "" || url.cannotBeABaseURL || url.scheme === "file";
  }
  function isNormalizedWindowsDriveLetter(string) {
    return /^[A-Za-z]:$/u.test(string);
  }
  const fileOtherwiseCodePoints = /* @__PURE__ */ new Set([p("/"), p("\\"), p("?"), p("#")]);
  function startsWithWindowsDriveLetter(input, pointer) {
    const length = input.length - pointer;
    return length >= 2 && isWindowsDriveLetterCodePoints(input[pointer], input[pointer + 1]) && (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]));
  }
  function serializeOrigin(tuple) {
    let result = `${tuple.scheme}://`;
    result += serializeHost(tuple.host);
    if (tuple.port !== null) {
      result += `:${tuple.port}`;
    }
    return result;
  }
  class URLStateMachine {
    pointer;
    input;
    base;
    encodingOverride;
    state;
    stateOverride;
    url;
    failure;
    parseError;
    buffer;
    atFlag;
    arrFlag;
    passwordTokenSeenFlag;
    constructor(input, base, encodingOverride, url, stateOverride) {
      this.pointer = 0;
      this.input = input;
      this.base = base || null;
      this.encodingOverride = encodingOverride || "utf-8";
      this.stateOverride = stateOverride;
      this.url = url;
      this.failure = false;
      this.parseError = false;
      if (!this.url) {
        this.url = {
          scheme: "",
          username: "",
          password: "",
          host: null,
          port: null,
          path: [],
          query: null,
          fragment: null,
          cannotBeABaseURL: false
        };
        const res2 = trimControlChars(this.input);
        if (res2 !== this.input) {
          this.parseError = true;
        }
        this.input = res2;
      }
      const res = trimTabAndNewline(this.input);
      if (res !== this.input) {
        this.parseError = true;
      }
      this.input = res;
      this.state = stateOverride || "scheme start";
      this.buffer = "";
      this.atFlag = false;
      this.arrFlag = false;
      this.passwordTokenSeenFlag = false;
      this.input = Array.from(this.input, (c) => c.codePointAt(0));
      for (; this.pointer <= this.input.length; ++this.pointer) {
        const c = this.input[this.pointer];
        const cStr = isNaN(c) ? void 0 : String.fromCodePoint(c);
        const ret = this[`parse ${this.state}`](c, cStr);
        if (!ret) {
          break;
        } else if (ret === failure) {
          this.failure = true;
          break;
        }
      }
    }
    "parse scheme start"(c, cStr) {
      if (isASCIIAlpha(c)) {
        this.buffer += cStr.toLowerCase();
        this.state = "scheme";
      } else if (!this.stateOverride) {
        this.state = "no scheme";
        --this.pointer;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    }
    "parse scheme"(c, cStr) {
      if (isASCIIAlphanumeric(c) || c === p("+") || c === p("-") || c === p(".")) {
        this.buffer += cStr.toLowerCase();
      } else if (c === p(":")) {
        if (this.stateOverride) {
          if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
            return false;
          }
          if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
            return false;
          }
          if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
            return false;
          }
          if (this.url.scheme === "file" && this.url.host === "") {
            return false;
          }
        }
        this.url.scheme = this.buffer;
        if (this.stateOverride) {
          if (this.url.port === defaultPort(this.url.scheme)) {
            this.url.port = null;
          }
          return false;
        }
        this.buffer = "";
        if (this.url.scheme === "file") {
          if (this.input[this.pointer + 1] !== p("/") || this.input[this.pointer + 2] !== p("/")) {
            this.parseError = true;
          }
          this.state = "file";
        } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
          this.state = "special relative or authority";
        } else if (isSpecial(this.url)) {
          this.state = "special authority slashes";
        } else if (this.input[this.pointer + 1] === p("/")) {
          this.state = "path or authority";
          ++this.pointer;
        } else {
          this.url.cannotBeABaseURL = true;
          this.url.path.push("");
          this.state = "cannot-be-a-base-URL path";
        }
      } else if (!this.stateOverride) {
        this.buffer = "";
        this.state = "no scheme";
        this.pointer = -1;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    }
    "parse no scheme"(c) {
      if (this.base === null || this.base.cannotBeABaseURL && c !== p("#")) {
        return failure;
      } else if (this.base.cannotBeABaseURL && c === p("#")) {
        this.url.scheme = this.base.scheme;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        this.url.fragment = "";
        this.url.cannotBeABaseURL = true;
        this.state = "fragment";
      } else if (this.base.scheme === "file") {
        this.state = "file";
        --this.pointer;
      } else {
        this.state = "relative";
        --this.pointer;
      }
      return true;
    }
    "parse special relative or authority"(c) {
      if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
      } else {
        this.parseError = true;
        this.state = "relative";
        --this.pointer;
      }
      return true;
    }
    "parse path or authority"(c) {
      if (c === p("/")) {
        this.state = "authority";
      } else {
        this.state = "path";
        --this.pointer;
      }
      return true;
    }
    "parse relative"(c) {
      this.url.scheme = this.base.scheme;
      if (c === p("/")) {
        this.state = "relative slash";
      } else if (isSpecial(this.url) && c === p("\\")) {
        this.parseError = true;
        this.state = "relative slash";
      } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        } else if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        } else if (!isNaN(c)) {
          this.url.query = null;
          this.url.path.pop();
          this.state = "path";
          --this.pointer;
        }
      }
      return true;
    }
    "parse relative slash"(c) {
      if (isSpecial(this.url) && (c === p("/") || c === p("\\"))) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "special authority ignore slashes";
      } else if (c === p("/")) {
        this.state = "authority";
      } else {
        this.url.username = this.base.username;
        this.url.password = this.base.password;
        this.url.host = this.base.host;
        this.url.port = this.base.port;
        this.state = "path";
        --this.pointer;
      }
      return true;
    }
    "parse special authority slashes"(c) {
      if (c === p("/") && this.input[this.pointer + 1] === p("/")) {
        this.state = "special authority ignore slashes";
        ++this.pointer;
      } else {
        this.parseError = true;
        this.state = "special authority ignore slashes";
        --this.pointer;
      }
      return true;
    }
    "parse special authority ignore slashes"(c) {
      if (c !== p("/") && c !== p("\\")) {
        this.state = "authority";
        --this.pointer;
      } else {
        this.parseError = true;
      }
      return true;
    }
    "parse authority"(c, cStr) {
      if (c === p("@")) {
        this.parseError = true;
        if (this.atFlag) {
          this.buffer = `%40${this.buffer}`;
        }
        this.atFlag = true;
        const len = countSymbols(this.buffer);
        for (let pointer = 0; pointer < len; ++pointer) {
          const codePoint = this.buffer.codePointAt(pointer);
          if (codePoint === p(":") && !this.passwordTokenSeenFlag) {
            this.passwordTokenSeenFlag = true;
            continue;
          }
          const encodedCodePoints = utf8PercentEncodeCodePoint(
            codePoint,
            isUserinfoPercentEncode
          );
          if (this.passwordTokenSeenFlag) {
            this.url.password += encodedCodePoints;
          } else {
            this.url.username += encodedCodePoints;
          }
        }
        this.buffer = "";
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        if (this.atFlag && this.buffer === "") {
          this.parseError = true;
          return failure;
        }
        this.pointer -= countSymbols(this.buffer) + 1;
        this.buffer = "";
        this.state = "host";
      } else {
        this.buffer += cStr;
      }
      return true;
    }
    "parse hostname"(c, cStr) {
      if (this.stateOverride && this.url.scheme === "file") {
        --this.pointer;
        this.state = "file host";
      } else if (c === p(":") && !this.arrFlag) {
        if (this.buffer === "") {
          this.parseError = true;
          return failure;
        }
        if (this.stateOverride === "hostname") {
          return false;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
          return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "port";
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\")) {
        --this.pointer;
        if (isSpecial(this.url) && this.buffer === "") {
          this.parseError = true;
          return failure;
        } else if (this.stateOverride && this.buffer === "" && (includesCredentials(this.url) || this.url.port !== null)) {
          this.parseError = true;
          return false;
        }
        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
          return failure;
        }
        this.url.host = host;
        this.buffer = "";
        this.state = "path start";
        if (this.stateOverride) {
          return false;
        }
      } else {
        if (c === p("[")) {
          this.arrFlag = true;
        } else if (c === p("]")) {
          this.arrFlag = false;
        }
        this.buffer += cStr;
      }
      return true;
    }
    "parse host"(c, cStr) {
      return this["parse hostname"](c, cStr);
    }
    "parse port"(c, cStr) {
      if (isASCIIDigit(c)) {
        this.buffer += cStr;
      } else if (isNaN(c) || c === p("/") || c === p("?") || c === p("#") || isSpecial(this.url) && c === p("\\") || this.stateOverride) {
        if (this.buffer !== "") {
          const port = parseInt(this.buffer);
          if (port > 2 ** 16 - 1) {
            this.parseError = true;
            return failure;
          }
          this.url.port = port === defaultPort(this.url.scheme) ? null : port;
          this.buffer = "";
        }
        if (this.stateOverride) {
          return false;
        }
        this.state = "path start";
        --this.pointer;
      } else {
        this.parseError = true;
        return failure;
      }
      return true;
    }
    "parse file"(c) {
      this.url.scheme = "file";
      this.url.host = "";
      if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "file slash";
      } else if (this.base !== null && this.base.scheme === "file") {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        this.url.query = this.base.query;
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        } else if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        } else if (!isNaN(c)) {
          this.url.query = null;
          if (!startsWithWindowsDriveLetter(this.input, this.pointer)) {
            shortenPath(this.url);
          } else {
            this.parseError = true;
            this.url.path = [];
          }
          this.state = "path";
          --this.pointer;
        }
      } else {
        this.state = "path";
        --this.pointer;
      }
      return true;
    }
    "parse file slash"(c) {
      if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "file host";
      } else {
        if (this.base !== null && this.base.scheme === "file") {
          if (!startsWithWindowsDriveLetter(
            this.input,
            this.pointer
          ) && isNormalizedWindowsDriveLetterString(this.base.path[0])) {
            this.url.path.push(this.base.path[0]);
          }
          this.url.host = this.base.host;
        }
        this.state = "path";
        --this.pointer;
      }
      return true;
    }
    "parse file host"(c, cStr) {
      if (isNaN(c) || c === p("/") || c === p("\\") || c === p("?") || c === p("#")) {
        --this.pointer;
        if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
          this.parseError = true;
          this.state = "path";
        } else if (this.buffer === "") {
          this.url.host = "";
          if (this.stateOverride) {
            return false;
          }
          this.state = "path start";
        } else {
          let host = parseHost(this.buffer, isNotSpecial(this.url));
          if (host === failure) {
            return failure;
          }
          if (host === "localhost") {
            host = "";
          }
          this.url.host = host;
          if (this.stateOverride) {
            return false;
          }
          this.buffer = "";
          this.state = "path start";
        }
      } else {
        this.buffer += cStr;
      }
      return true;
    }
    "parse path start"(c) {
      if (isSpecial(this.url)) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "path";
        if (c !== p("/") && c !== p("\\")) {
          --this.pointer;
        }
      } else if (!this.stateOverride && c === p("?")) {
        this.url.query = "";
        this.state = "query";
      } else if (!this.stateOverride && c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
      } else if (c !== void 0) {
        this.state = "path";
        if (c !== p("/")) {
          --this.pointer;
        }
      } else if (this.stateOverride && this.url.host === null) {
        this.url.path.push("");
      }
      return true;
    }
    "parse path"(c) {
      if (isNaN(c) || c === p("/") || isSpecial(this.url) && c === p("\\") || !this.stateOverride && (c === p("?") || c === p("#"))) {
        if (isSpecial(this.url) && c === p("\\")) {
          this.parseError = true;
        }
        if (isDoubleDot(this.buffer)) {
          shortenPath(this.url);
          if (c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
            this.url.path.push("");
          }
        } else if (isSingleDot(this.buffer) && c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
          this.url.path.push("");
        } else if (!isSingleDot(this.buffer)) {
          if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
            this.buffer = `${this.buffer[0]}:`;
          }
          this.url.path.push(this.buffer);
        }
        this.buffer = "";
        if (c === p("?")) {
          this.url.query = "";
          this.state = "query";
        }
        if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        }
      } else {
        if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.buffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
      }
      return true;
    }
    "parse cannot-be-a-base-URL path"(c) {
      if (c === p("?")) {
        this.url.query = "";
        this.state = "query";
      } else if (c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
      } else {
        if (!isNaN(c) && c !== p("%")) {
          this.parseError = true;
        }
        if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        if (!isNaN(c)) {
          this.url.path[0] += utf8PercentEncodeCodePoint(
            c,
            isC0ControlPercentEncode
          );
        }
      }
      return true;
    }
    "parse query"(c, cStr) {
      if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
        this.encodingOverride = "utf-8";
      }
      if (!this.stateOverride && c === p("#") || isNaN(c)) {
        const queryPercentEncodePredicate = isSpecial(this.url) ? isSpecialQueryPercentEncode : isQueryPercentEncode;
        this.url.query += utf8PercentEncodeString(
          this.buffer,
          queryPercentEncodePredicate
        );
        this.buffer = "";
        if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        }
      } else if (!isNaN(c)) {
        if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.buffer += cStr;
      }
      return true;
    }
    "parse fragment"(c) {
      if (!isNaN(c)) {
        if (c === p("%") && (!isASCIIHex(this.input[this.pointer + 1]) || !isASCIIHex(this.input[this.pointer + 2]))) {
          this.parseError = true;
        }
        this.url.fragment += utf8PercentEncodeCodePoint(
          c,
          isFragmentPercentEncode
        );
      }
      return true;
    }
  }
  function serializeURL(url, excludeFragment) {
    let output = `${url.scheme}:`;
    if (url.host !== null) {
      output += "//";
      if (url.username !== "" || url.password !== "") {
        output += url.username;
        if (url.password !== "") {
          output += `:${url.password}`;
        }
        output += "@";
      }
      output += serializeHost(url.host);
      if (url.port !== null) {
        output += `:${url.port}`;
      }
    }
    if (url.cannotBeABaseURL) {
      output += url.path[0];
    } else {
      if (url.host === null && url.path.length > 1 && url.path[0] === "") {
        output += "/.";
      }
      for (const segment of url.path) {
        output += `/${segment}`;
      }
    }
    if (url.query !== null) {
      output += `?${url.query}`;
    }
    if (!excludeFragment && url.fragment !== null) {
      output += `#${url.fragment}`;
    }
    return output;
  }
  function serializeURLOrigin(url) {
    switch (url.scheme) {
      case "blob":
        try {
          return serializeURLOrigin(parseURL(url.path[0]));
        } catch (e) {
          return "null";
        }
      case "ftp":
      case "http":
      case "https":
      case "ws":
      case "wss":
        return serializeOrigin({
          scheme: url.scheme,
          host: url.host,
          port: url.port
        });
      case "file":
        return "null";
      default:
        return "null";
    }
  }
  function basicURLParse(input, options) {
    if (options === void 0) {
      options = {};
    }
    const usm = new URLStateMachine(
      input,
      options.baseURL,
      options.encodingOverride,
      options.url,
      options.stateOverride
    );
    if (usm.failure) {
      return null;
    }
    return usm.url;
  }
  function setTheUsername(url, username) {
    url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
  }
  function setThePassword(url, password) {
    url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
  }
  function serializeInteger(integer) {
    return integer.toString();
  }
  function parseURL(input, options) {
    if (options === void 0) {
      options = {};
    }
    return basicURLParse(input, {
      baseURL: options.baseURL,
      encodingOverride: options.encodingOverride
    });
  }
  class URLSearchParams {
    static createInstanceNoStrip(init) {
      const instance = Object.create(URLSearchParams.prototype);
      instance._list = [];
      instance._url = null;
      instance.__initialize(init);
      return instance;
    }
    _list = [];
    _url = null;
    constructor(init) {
      if (typeof init === "string" && init[0] === "?") {
        init = init.slice(1);
      }
      this.__initialize(init);
    }
    __initialize(init) {
      if (Array.isArray(init)) {
        for (const pair of init) {
          if (pair.length !== 2) {
            throw new TypeError(
              "Failed to construct 'URLSearchParams': parameter 1 sequence's element does not contain exactly two elements."
            );
          }
          this._list.push([pair[0], pair[1]]);
        }
      } else if (typeof init === "object" && Object.getPrototypeOf(init) === null) {
        for (const name of Object.keys(init)) {
          const value = init[name];
          this._list.push([name, value]);
        }
      } else {
        this._list = parseUrlencodedString(init);
      }
    }
    _updateSteps() {
      if (this._url !== null) {
        let query = serializeUrlencoded(this._list);
        if (query === "") {
          query = null;
        }
        this._url._url.query = query;
      }
    }
    append(name, value) {
      this._list.push([name, value]);
      this._updateSteps();
    }
    delete(name) {
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i][0] === name) {
          this._list.splice(i, 1);
        } else {
          i++;
        }
      }
      this._updateSteps();
    }
    get(name) {
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          return tuple[1];
        }
      }
      return null;
    }
    getAll(name) {
      const output = [];
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          output.push(tuple[1]);
        }
      }
      return output;
    }
    has(name) {
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          return true;
        }
      }
      return false;
    }
    set(name, value) {
      let found = false;
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i][0] === name) {
          if (found) {
            this._list.splice(i, 1);
          } else {
            found = true;
            this._list[i][1] = value;
            i++;
          }
        } else {
          i++;
        }
      }
      if (!found) {
        this._list.push([name, value]);
      }
      this._updateSteps();
    }
    sort() {
      this._list.sort((a, b) => {
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      });
      this._updateSteps();
    }
    [Symbol.iterator]() {
      return this._list[Symbol.iterator]();
    }
    toString() {
      return serializeUrlencoded(this._list);
    }
  }
  class URL {
    _url;
    _query;
    constructor(url, base) {
      let parsedBase = null;
      if (base !== void 0) {
        parsedBase = basicURLParse(base);
        if (parsedBase === null) {
          throw new TypeError(`Invalid base URL: ${base}`);
        }
      }
      const parsedURL = basicURLParse(url, { baseURL: parsedBase });
      if (parsedURL === null) {
        throw new TypeError(`Invalid URL: ${url}`);
      }
      const query = parsedURL.query !== null ? parsedURL.query : "";
      this._url = parsedURL;
      this._query = URLSearchParams.createInstanceNoStrip(query);
      this._query._url = this;
    }
    get href() {
      return serializeURL(this._url);
    }
    set href(v) {
      const parsedURL = basicURLParse(v);
      if (parsedURL === null) {
        throw new TypeError(`Invalid URL: ${v}`);
      }
      this._url = parsedURL;
      this._query._list.splice(0);
      const { query } = parsedURL;
      if (query !== null) {
        this._query._list = parseUrlencodedString(query);
      }
    }
    get origin() {
      return serializeURLOrigin(this._url);
    }
    get protocol() {
      return `${this._url.scheme}:`;
    }
    set protocol(v) {
      basicURLParse(`${v}:`, {
        url: this._url,
        stateOverride: "scheme start"
      });
    }
    get username() {
      return this._url.username;
    }
    set username(v) {
      if (cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      setTheUsername(this._url, v);
    }
    get password() {
      return this._url.password;
    }
    set password(v) {
      if (cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      setThePassword(this._url, v);
    }
    get host() {
      const url = this._url;
      if (url.host === null) {
        return "";
      }
      if (url.port === null) {
        return serializeHost(url.host);
      }
      return `${serializeHost(url.host)}:${serializeInteger(url.port)}`;
    }
    set host(v) {
      if (this._url.cannotBeABaseURL) {
        return;
      }
      basicURLParse(v, { url: this._url, stateOverride: "host" });
    }
    get hostname() {
      if (this._url.host === null) {
        return "";
      }
      return serializeHost(this._url.host);
    }
    set hostname(v) {
      if (this._url.cannotBeABaseURL) {
        return;
      }
      basicURLParse(v, { url: this._url, stateOverride: "hostname" });
    }
    get port() {
      if (this._url.port === null) {
        return "";
      }
      return serializeInteger(this._url.port);
    }
    set port(v) {
      if (cannotHaveAUsernamePasswordPort(this._url)) {
        return;
      }
      if (v === "") {
        this._url.port = null;
      } else {
        basicURLParse(v, { url: this._url, stateOverride: "port" });
      }
    }
    get pathname() {
      if (this._url.cannotBeABaseURL) {
        return this._url.path[0];
      }
      if (this._url.path.length === 0) {
        return "";
      }
      return `/${this._url.path.join("/")}`;
    }
    set pathname(v) {
      if (this._url.cannotBeABaseURL) {
        return;
      }
      this._url.path = [];
      basicURLParse(v, { url: this._url, stateOverride: "path start" });
    }
    get search() {
      if (this._url.query === null || this._url.query === "") {
        return "";
      }
      return `?${this._url.query}`;
    }
    set search(v) {
      const url = this._url;
      if (v === "") {
        url.query = null;
        this._query._list = [];
        return;
      }
      const input = v[0] === "?" ? v.substring(1) : v;
      url.query = "";
      basicURLParse(input, { url, stateOverride: "query" });
      this._query._list = parseUrlencodedString(input);
    }
    get searchParams() {
      return this._query;
    }
    get hash() {
      if (this._url.fragment === null || this._url.fragment === "") {
        return "";
      }
      return `#${this._url.fragment}`;
    }
    set hash(v) {
      if (v === "") {
        this._url.fragment = null;
        return;
      }
      const input = v[0] === "#" ? v.substring(1) : v;
      this._url.fragment = "";
      basicURLParse(input, { url: this._url, stateOverride: "fragment" });
    }
    toJSON() {
      return this.href;
    }
    toString() {
      return this.href;
    }
  }
  Object.defineProperties(URL.prototype, {
    [Symbol.toStringTag]: { value: "URL", configurable: true }
  });
  return {
    URL,
    URLSearchParams
  };
});
