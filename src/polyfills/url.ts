/* eslint-disable @typescript-eslint/no-confusing-non-null-assertion */

import { registerPolyfills } from "./shared/polyfill-global";

/**
 * Stolen from:
 * https://github.com/charpeni/whatwg-url/blob/whatwg-url-without-unicode
 *
 * Original license:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015–2016 Sebastian Mayr
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
registerPolyfills(
  "URL",
  "URLSearchParams",
)(() => {
  // #region encoding

  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder("utf-8", { ignoreBOM: true });

  function utf8Encode(str: string) {
    return utf8Encoder.encode(str);
  }

  function utf8DecodeWithoutBOM(bytes: Uint8Array) {
    return utf8Decoder.decode(bytes);
  }

  function isASCIIDigit(c: number) {
    return c >= 0x30 && c <= 0x39;
  }

  function isASCIIAlpha(c: number) {
    return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);
  }

  function isASCIIAlphanumeric(c: number) {
    return isASCIIAlpha(c) || isASCIIDigit(c);
  }

  function isASCIIHex(c: number) {
    return (
      isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66)
    );
  }

  function p(char: string) {
    return char.codePointAt(0)!;
  }

  // https://url.spec.whatwg.org/#percent-encode
  function percentEncode(c: { toString(number: number): string }) {
    let hex = c.toString(16).toUpperCase();
    if (hex.length === 1) {
      hex = `0${hex}`;
    }

    return `%${hex}`;
  }

  // https://url.spec.whatwg.org/#percent-decode
  function percentDecodeBytes(input: Buffer | Uint8Array) {
    const output = new Uint8Array(input.byteLength);
    let outputIndex = 0;
    for (let i = 0; i < input.byteLength; ++i) {
      const byte = input[i]!;
      if (byte !== 0x25) {
        output[outputIndex++] = byte;
      } else if (
        byte === 0x25 &&
        (!isASCIIHex(input[i + 1]!) || !isASCIIHex(input[i + 2]!))
      ) {
        output[outputIndex++] = byte;
      } else {
        const bytePoint = parseInt(
          String.fromCodePoint(input[i + 1]!, input[i + 2]!),
          16,
        );
        output[outputIndex++] = bytePoint;
        i += 2;
      }
    }

    return output.slice(0, outputIndex);
  }

  // https://url.spec.whatwg.org/#string-percent-decode
  function percentDecodeString(input: string) {
    const bytes = utf8Encode(input);
    return percentDecodeBytes(bytes);
  }

  // https://url.spec.whatwg.org/#c0-control-percent-encode-set
  function isC0ControlPercentEncode(c: number) {
    return c <= 0x1f || c > 0x7e;
  }

  // https://url.spec.whatwg.org/#fragment-percent-encode-set
  const extraFragmentPercentEncodeSet = new Set([
    p(" "),
    p('"'),
    p("<"),
    p(">"),
    p("`"),
  ]);
  function isFragmentPercentEncode(c: number) {
    return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
  }

  // https://url.spec.whatwg.org/#query-percent-encode-set
  const extraQueryPercentEncodeSet = new Set([
    p(" "),
    p('"'),
    p("#"),
    p("<"),
    p(">"),
  ]);
  function isQueryPercentEncode(c: number) {
    return isC0ControlPercentEncode(c) || extraQueryPercentEncodeSet.has(c);
  }

  // https://url.spec.whatwg.org/#special-query-percent-encode-set
  function isSpecialQueryPercentEncode(c: number) {
    return isQueryPercentEncode(c) || c === p("'");
  }

  // https://url.spec.whatwg.org/#path-percent-encode-set
  const extraPathPercentEncodeSet = new Set([p("?"), p("`"), p("{"), p("}")]);
  function isPathPercentEncode(c: number) {
    return isQueryPercentEncode(c) || extraPathPercentEncodeSet.has(c);
  }

  // https://url.spec.whatwg.org/#userinfo-percent-encode-set
  const extraUserinfoPercentEncodeSet = new Set([
    p("/"),
    p(":"),
    p(";"),
    p("="),
    p("@"),
    p("["),
    p("\\"),
    p("]"),
    p("^"),
    p("|"),
  ]);
  function isUserinfoPercentEncode(c: number) {
    return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
  }

  // https://url.spec.whatwg.org/#component-percent-encode-set
  const extraComponentPercentEncodeSet = new Set([
    p("$"),
    p("%"),
    p("&"),
    p("+"),
    p(","),
  ]);
  function isComponentPercentEncode(c: number) {
    return isUserinfoPercentEncode(c) || extraComponentPercentEncodeSet.has(c);
  }

  // https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set
  const extraURLEncodedPercentEncodeSet = new Set([
    p("!"),
    p("'"),
    p("("),
    p(")"),
    p("~"),
  ]);
  function isURLEncodedPercentEncode(c: number) {
    return (
      isComponentPercentEncode(c) || extraURLEncodedPercentEncodeSet.has(c)
    );
  }

  // https://url.spec.whatwg.org/#code-point-percent-encode-after-encoding
  // https://url.spec.whatwg.org/#utf-8-percent-encode
  // BEGIN: ed8c6549bwf9 - Assuming encoding is always utf-8 allows us to
  // trim one of the logic branches. TODO: support encoding.
  // The "-Internal" variant here has code points as JS strings. The external
  // version used by other files has code points
  // as JS numbers, like the rest of the codebase.
  function utf8PercentEncodeCodePointInternal(
    codePoint: string,
    percentEncodePredicate: (b: number) => boolean,
  ) {
    const bytes = utf8Encode(codePoint);
    let output = "";
    for (const byte of bytes) {
      // Our percentEncodePredicate operates on bytes, not code points,
      // so this is slightly different from the spec.
      if (!percentEncodePredicate(byte)) {
        output += String.fromCharCode(byte);
      } else {
        output += percentEncode(byte);
      }
    }

    return output;
  }

  function utf8PercentEncodeCodePoint(
    codePoint: number,
    percentEncodePredicate: (b: number) => boolean,
  ) {
    return utf8PercentEncodeCodePointInternal(
      String.fromCodePoint(codePoint),
      percentEncodePredicate,
    );
  }

  // https://url.spec.whatwg.org/#string-percent-encode-after-encoding
  // https://url.spec.whatwg.org/#string-utf-8-percent-encode
  function utf8PercentEncodeString(
    input: string,
    percentEncodePredicate: (b: number) => boolean,
    spaceAsPlus = false,
  ) {
    let output = "";
    for (const codePoint of input) {
      if (spaceAsPlus && codePoint === " ") {
        output += "+";
      } else {
        output += utf8PercentEncodeCodePointInternal(
          codePoint,
          percentEncodePredicate,
        );
      }
    }
    return output;
  }

  // https://url.spec.whatwg.org/#concept-urlencoded-parser
  function parseUrlencoded(input: Buffer | Uint8Array) {
    const sequences = strictlySplitByteSequence(input, p("&"));
    const output: Array<[string, string | readonly string[]]> = [];
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

      name = replaceByteInByteSequence(name, 0x2b, 0x20);
      value = replaceByteInByteSequence(value, 0x2b, 0x20);

      const nameString = utf8DecodeWithoutBOM(percentDecodeBytes(name));
      const valueString = utf8DecodeWithoutBOM(percentDecodeBytes(value));

      output.push([nameString, valueString]);
    }
    return output;
  }

  // https://url.spec.whatwg.org/#concept-urlencoded-string-parser
  function parseUrlencodedString(input: string) {
    return parseUrlencoded(utf8Encode(input));
  }

  // https://url.spec.whatwg.org/#concept-urlencoded-serializer
  function serializeUrlencoded(
    tuples: Array<[string, any, "hidden" | "file"] | [string, any]>,
    encodingOverride = undefined,
  ) {
    let encoding = "utf-8";
    if (encodingOverride !== undefined) {
      // TODO "get the output encoding", i.e. handle encoding labels vs. names.
      encoding = encodingOverride;
    }

    let output = "";
    for (const [i, tuple] of tuples.entries()) {
      // TODO: handle encoding override

      const name = utf8PercentEncodeString(
        tuple[0],
        isURLEncodedPercentEncode,
        true,
      );

      let value = tuple[1];
      if (tuple.length > 2 && tuple[2] !== undefined) {
        if (tuple[2] === "hidden" && name === "_charset_") {
          value = encoding;
        } else if (tuple[2] === "file") {
          // value is a File object
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

  function strictlySplitByteSequence(buf: Buffer | Uint8Array, cp: number) {
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

  function replaceByteInByteSequence(
    buf: Buffer | Uint8Array,
    from: number,
    to: number,
  ) {
    let i = buf.indexOf(from);
    while (i >= 0) {
      buf[i] = to;
      i = buf.indexOf(from, i + 1);
    }
    return buf;
  }

  // #endregion

  // #region URL state machine
  const specialSchemes = {
    ftp: 21,
    file: null,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443,
  };

  const failure = Symbol("failure");

  function countSymbols(str: string) {
    return [...str].length;
  }

  function at(input: number[], idx: number) {
    const c = input[idx]!;
    return isNaN(c) ? undefined : String.fromCodePoint(c);
  }

  function isSingleDot(buffer: string) {
    return buffer === "." || buffer.toLowerCase() === "%2e";
  }

  function isDoubleDot(buffer: string) {
    buffer = buffer.toLowerCase();
    return (
      buffer === ".." ||
      buffer === "%2e." ||
      buffer === ".%2e" ||
      buffer === "%2e%2e"
    );
  }

  function isWindowsDriveLetterCodePoints(cp1: number, cp2: number) {
    return isASCIIAlpha(cp1) && (cp2 === p(":") || cp2 === p("|"));
  }

  function isWindowsDriveLetterString(str: string) {
    return (
      str.length === 2 &&
      isASCIIAlpha(str.codePointAt(0)!) &&
      (str[1] === ":" || str[1] === "|")
    );
  }

  function isNormalizedWindowsDriveLetterString(str: string) {
    return (
      str.length === 2 && isASCIIAlpha(str.codePointAt(0)!) && str[1] === ":"
    );
  }

  function containsForbiddenHostCodePoint(str: string) {
    return (
      str.search(
        /\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u,
      ) !== -1
    );
  }

  function containsForbiddenHostCodePointExcludingPercent(str: string) {
    return (
      str.search(
        /\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u,
      ) !== -1
    );
  }

  function isSpecialScheme(scheme: string) {
    // @ts-expect-error
    return specialSchemes[scheme] !== undefined;
  }

  function isSpecial(url: { scheme: string }) {
    return isSpecialScheme(url.scheme);
  }

  function isNotSpecial(url: { scheme: string }) {
    return !isSpecialScheme(url.scheme);
  }

  function defaultPort(scheme: string) {
    // @ts-expect-error
    return specialSchemes[scheme];
  }

  function parseIPv4Number(input: string) {
    if (input === "") {
      return failure;
    }

    let R = 10;

    if (
      input.length >= 2 &&
      input.charAt(0) === "0" &&
      input.charAt(1).toLowerCase() === "x"
    ) {
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

  function parseIPv4(input: string) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
      if (parts.length > 1) {
        parts.pop();
      }
    }

    if (parts.length > 4) {
      return failure;
    }

    const numbers: number[] = [];
    for (const part of parts) {
      const n = parseIPv4Number(part);
      if (n === failure) {
        return failure;
      }

      numbers.push(n);
    }

    for (let i = 0; i < numbers.length - 1; ++i) {
      if (numbers[i]! > 255) {
        return failure;
      }
    }
    if (numbers[numbers.length - 1]! >= 256 ** (5 - numbers.length)) {
      return failure;
    }

    let ipv4 = numbers.pop()!;
    let counter = 0;

    for (const n of numbers) {
      ipv4 += n * 256 ** (3 - counter);
      ++counter;
    }

    return ipv4;
  }

  function serializeIPv4(address: number) {
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

  function parseIPv6(inputStr: string) {
    const address = [0, 0, 0, 0, 0, 0, 0, 0];
    let pieceIndex = 0;
    let compress = null;
    let pointer = 0;

    const input = Array.from(inputStr, (c) => c.codePointAt(0)) as number[];

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

      while (length < 4 && isASCIIHex(input[pointer]!)) {
        value = value * 0x10 + parseInt(at(input, pointer)!, 16);
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

        while (input[pointer] !== undefined) {
          let ipv4Piece: number | null = null;

          if (numbersSeen > 0) {
            if (input[pointer] === p(".") && numbersSeen < 4) {
              ++pointer;
            } else {
              return failure;
            }
          }

          if (!isASCIIDigit(input[pointer]!)) {
            return failure;
          }

          while (isASCIIDigit(input[pointer]!)) {
            const number = parseInt(at(input, pointer)!);
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

          address[pieceIndex] = address[pieceIndex]! * 0x100 + ipv4Piece!;

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
        if (input[pointer] === undefined) {
          return failure;
        }
      } else if (input[pointer] !== undefined) {
        return failure;
      }

      address[pieceIndex] = value;
      ++pieceIndex;
    }

    if (compress !== null) {
      let swaps = pieceIndex - compress;
      pieceIndex = 7;
      while (pieceIndex !== 0 && swaps > 0) {
        const temp = address[compress + swaps - 1]!;
        address[compress + swaps - 1]! = address[pieceIndex]!;
        address[pieceIndex]! = temp;
        --pieceIndex;
        --swaps;
      }
    } else if (compress === null && pieceIndex !== 8) {
      return failure;
    }

    return address;
  }

  function serializeIPv6(address: Array<number>) {
    let output = "";
    const compress = findLongestZeroSequence(address);
    let ignore0 = false;

    for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
      if (ignore0 && address[pieceIndex]! === 0) {
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

      output += address[pieceIndex]!.toString(16);

      if (pieceIndex !== 7) {
        output += ":";
      }
    }

    return output;
  }

  function parseHost(input: string, isNotSpecialArg = false) {
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

  function endsInANumber(input: string) {
    const parts = input.split(".");
    if (parts[parts.length - 1] === "") {
      if (parts.length === 1) {
        return false;
      }
      parts.pop();
    }

    const last = parts[parts.length - 1]!;
    if (parseIPv4Number(last) !== failure) {
      return true;
    }

    if (/^[0-9]+$/u.test(last)) {
      return true;
    }

    return false;
  }

  function parseOpaqueHost(input: string) {
    if (containsForbiddenHostCodePointExcludingPercent(input)) {
      return failure;
    }

    return utf8PercentEncodeString(input, isC0ControlPercentEncode);
  }

  function findLongestZeroSequence(arr: number[]) {
    let maxIdx = null;
    let maxLen = 1; // only find elements > 1
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

    // if trailing zeros
    if (currLen > maxLen) {
      return currStart;
    }

    return maxIdx;
  }

  function serializeHost(host: string | number | Array<number>) {
    if (typeof host === "number") {
      return serializeIPv4(host);
    }

    // IPv6 serializer
    if (host instanceof Array) {
      return `[${serializeIPv6(host)}]`;
    }

    return host;
  }

  function domainToASCII(domain: string) {
    const result = domain;

    if (result === null || result === "") {
      return failure;
    }
    return result;
  }

  function trimControlChars(url: string) {
    return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/gu, "");
  }

  function trimTabAndNewline(url: string) {
    return url.replace(/\u0009|\u000A|\u000D/gu, "");
  }

  function shortenPath(url: { path: any[]; scheme: string }) {
    const { path } = url;
    if (path.length === 0) {
      return;
    }
    if (
      url.scheme === "file" &&
      path.length === 1 &&
      isNormalizedWindowsDriveLetter(path[0])
    ) {
      return;
    }

    path.pop();
  }

  function includesCredentials(url: { username: string; password: string }) {
    return url.username !== "" || url.password !== "";
  }

  function cannotHaveAUsernamePasswordPort(url: {
    scheme: string;
    host: null | string;
    cannotBeABaseURL: boolean;
  }) {
    return (
      url.host === null ||
      url.host === "" ||
      url.cannotBeABaseURL ||
      url.scheme === "file"
    );
  }

  function isNormalizedWindowsDriveLetter(string: string) {
    return /^[A-Za-z]:$/u.test(string);
  }

  type UrlObject = {
    scheme: string;
    username: string;
    password: string;
    host: null | string;
    port: null | number;
    path: string[];
    query: null | string;
    fragment: null | string;
    cannotBeABaseURL: boolean;
  };

  const fileOtherwiseCodePoints = new Set([p("/"), p("\\"), p("?"), p("#")]);

  function startsWithWindowsDriveLetter(input: number[], pointer: number) {
    const length = input.length - pointer;
    return (
      length >= 2 &&
      isWindowsDriveLetterCodePoints(input[pointer]!, input[pointer + 1]!) &&
      (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]!))
    );
  }

  function serializeOrigin(tuple: {
    scheme: string;
    host: string;
    port: number;
  }) {
    let result = `${tuple.scheme}://`;
    result += serializeHost(tuple.host!);

    if (tuple.port !== null) {
      result += `:${tuple.port}`;
    }

    return result;
  }

  class URLStateMachine {
    pointer: number;
    input: string | Array<number>;
    base: UrlObject | null;
    encodingOverride: string;
    state: string;
    stateOverride: string | undefined;
    url: UrlObject;
    failure: boolean;
    parseError: boolean;
    buffer: string;
    atFlag: boolean;
    arrFlag: boolean;
    passwordTokenSeenFlag: boolean;

    constructor(
      input: string,
      base: UrlObject | null | undefined,
      encodingOverride: string | undefined,
      url: UrlObject | undefined,
      stateOverride: string | undefined,
    ) {
      this.pointer = 0;
      this.input = input;
      this.base = base || null;
      this.encodingOverride = encodingOverride || "utf-8";
      this.stateOverride = stateOverride;
      // @ts-expect-error
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

          cannotBeABaseURL: false,
        };

        const res = trimControlChars(this.input);
        if (res !== this.input) {
          this.parseError = true;
        }
        this.input = res;
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

      this.input = Array.from(this.input, (c) => c.codePointAt(0)!);

      for (; this.pointer <= this.input.length; ++this.pointer) {
        const c = this.input[this.pointer]!;
        const cStr = isNaN(c) ? undefined : String.fromCodePoint(c);

        // exec state machine
        // @ts-expect-error
        const ret = this[`parse ${this.state}`](c, cStr);
        if (!ret) {
          break; // terminate algorithm
        } else if (ret === failure) {
          this.failure = true;
          break;
        }
      }
    }

    "parse scheme start"(c: number, cStr: string) {
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

    "parse scheme"(c: number, cStr: string) {
      if (
        isASCIIAlphanumeric(c) ||
        c === p("+") ||
        c === p("-") ||
        c === p(".")
      ) {
        this.buffer += cStr.toLowerCase();
      } else if (c === p(":")) {
        if (this.stateOverride) {
          if (isSpecial(this.url) && !isSpecialScheme(this.buffer as any)) {
            return false;
          }

          if (!isSpecial(this.url) && isSpecialScheme(this.buffer as any)) {
            return false;
          }

          if (
            (includesCredentials(this.url) || this.url.port !== null) &&
            this.buffer === "file"
          ) {
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
          if (
            this.input[this.pointer + 1] !== p("/") ||
            this.input[this.pointer + 2] !== p("/")
          ) {
            this.parseError = true;
          }
          this.state = "file";
        } else if (
          isSpecial(this.url) &&
          this.base !== null &&
          this.base.scheme === this.url.scheme
        ) {
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

    "parse no scheme"(c: number) {
      if (this.base === null || (this.base.cannotBeABaseURL && c !== p("#"))) {
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

    "parse special relative or authority"(c: number) {
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

    "parse path or authority"(c: number) {
      if (c === p("/")) {
        this.state = "authority";
      } else {
        this.state = "path";
        --this.pointer;
      }

      return true;
    }

    "parse relative"(c: number) {
      this.url.scheme = this.base!.scheme;
      if (c === p("/")) {
        this.state = "relative slash";
      } else if (isSpecial(this.url) && c === p("\\")) {
        this.parseError = true;
        this.state = "relative slash";
      } else {
        this.url.username = this.base!.username;
        this.url.password = this.base!.password;
        this.url.host = this.base!.host;
        this.url.port = this.base!.port;
        this.url.path = this.base!.path.slice();
        this.url.query = this.base!.query;
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

    "parse relative slash"(c: number) {
      if (isSpecial(this.url) && (c === p("/") || c === p("\\"))) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "special authority ignore slashes";
      } else if (c === p("/")) {
        this.state = "authority";
      } else {
        this.url.username = this.base!.username;
        this.url.password = this.base!.password;
        this.url.host = this.base!.host;
        this.url.port = this.base!.port;
        this.state = "path";
        --this.pointer;
      }

      return true;
    }

    "parse special authority slashes"(c: number) {
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

    "parse special authority ignore slashes"(c: number) {
      if (c !== p("/") && c !== p("\\")) {
        this.state = "authority";
        --this.pointer;
      } else {
        this.parseError = true;
      }

      return true;
    }

    "parse authority"(c: number, cStr: string) {
      if (c === p("@")) {
        this.parseError = true;
        if (this.atFlag) {
          this.buffer = `%40${this.buffer}`;
        }
        this.atFlag = true;

        // careful, this is based on buffer and has its own pointer
        // (this.pointer != pointer) and inner chars
        const len = countSymbols(this.buffer);
        for (let pointer = 0; pointer < len; ++pointer) {
          const codePoint = this.buffer.codePointAt(pointer)!;

          if (codePoint === p(":") && !this.passwordTokenSeenFlag) {
            this.passwordTokenSeenFlag = true;
            continue;
          }
          const encodedCodePoints = utf8PercentEncodeCodePoint(
            codePoint,
            isUserinfoPercentEncode,
          );
          if (this.passwordTokenSeenFlag) {
            this.url.password += encodedCodePoints;
          } else {
            this.url.username += encodedCodePoints;
          }
        }
        this.buffer = "";
      } else if (
        isNaN(c) ||
        c === p("/") ||
        c === p("?") ||
        c === p("#") ||
        (isSpecial(this.url) && c === p("\\"))
      ) {
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

    "parse hostname"(c: number, cStr: string) {
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

        // @ts-expect-error
        this.url.host = host;
        this.buffer = "";
        this.state = "port";
      } else if (
        isNaN(c) ||
        c === p("/") ||
        c === p("?") ||
        c === p("#") ||
        (isSpecial(this.url) && c === p("\\"))
      ) {
        --this.pointer;
        if (isSpecial(this.url) && this.buffer === "") {
          this.parseError = true;
          return failure;
        } else if (
          this.stateOverride &&
          this.buffer === "" &&
          (includesCredentials(this.url) || this.url.port !== null)
        ) {
          this.parseError = true;
          return false;
        }

        const host = parseHost(this.buffer, isNotSpecial(this.url));
        if (host === failure) {
          return failure;
        }

        // @ts-expect-error
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

    "parse host"(c: number, cStr: string) {
      return this["parse hostname"](c, cStr);
    }

    "parse port"(c: number, cStr: string) {
      if (isASCIIDigit(c)) {
        this.buffer += cStr;
      } else if (
        isNaN(c) ||
        c === p("/") ||
        c === p("?") ||
        c === p("#") ||
        (isSpecial(this.url) && c === p("\\")) ||
        this.stateOverride
      ) {
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

    "parse file"(c: number) {
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
          if (
            !startsWithWindowsDriveLetter(this.input as number[], this.pointer)
          ) {
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

    "parse file slash"(c: number) {
      if (c === p("/") || c === p("\\")) {
        if (c === p("\\")) {
          this.parseError = true;
        }
        this.state = "file host";
      } else {
        if (this.base !== null && this.base.scheme === "file") {
          if (
            !startsWithWindowsDriveLetter(
              this.input as number[],
              this.pointer,
            ) &&
            isNormalizedWindowsDriveLetterString(this.base.path[0]!)
          ) {
            this.url.path.push(this.base.path[0]!);
          }
          this.url.host = this.base.host;
        }
        this.state = "path";
        --this.pointer;
      }

      return true;
    }

    "parse file host"(c: number, cStr: string) {
      if (
        isNaN(c) ||
        c === p("/") ||
        c === p("\\") ||
        c === p("?") ||
        c === p("#")
      ) {
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
          // @ts-expect-error
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

    "parse path start"(c: number) {
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
      } else if (c !== undefined) {
        this.state = "path";
        if (c !== p("/")) {
          --this.pointer;
        }
      } else if (this.stateOverride && this.url.host === null) {
        this.url.path.push("");
      }

      return true;
    }

    "parse path"(c: number) {
      if (
        isNaN(c) ||
        c === p("/") ||
        (isSpecial(this.url) && c === p("\\")) ||
        (!this.stateOverride && (c === p("?") || c === p("#")))
      ) {
        if (isSpecial(this.url) && c === p("\\")) {
          this.parseError = true;
        }

        if (isDoubleDot(this.buffer)) {
          shortenPath(this.url);
          if (c !== p("/") && !(isSpecial(this.url) && c === p("\\"))) {
            this.url.path.push("");
          }
        } else if (
          isSingleDot(this.buffer) &&
          c !== p("/") &&
          !(isSpecial(this.url) && c === p("\\"))
        ) {
          this.url.path.push("");
        } else if (!isSingleDot(this.buffer)) {
          if (
            this.url.scheme === "file" &&
            this.url.path.length === 0 &&
            isWindowsDriveLetterString(this.buffer)
          ) {
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
        // TODO: If c is not a URL code point and not "%", parse error.

        if (
          c === p("%") &&
          (!isASCIIHex(this.input[this.pointer + 1] as number) ||
            !isASCIIHex(this.input[this.pointer + 2] as number))
        ) {
          this.parseError = true;
        }

        this.buffer += utf8PercentEncodeCodePoint(c, isPathPercentEncode);
      }

      return true;
    }

    "parse cannot-be-a-base-URL path"(c: number) {
      if (c === p("?")) {
        this.url.query = "";
        this.state = "query";
      } else if (c === p("#")) {
        this.url.fragment = "";
        this.state = "fragment";
      } else {
        // TODO: Add: not a URL code point
        if (!isNaN(c) && c !== p("%")) {
          this.parseError = true;
        }

        if (
          c === p("%") &&
          (!isASCIIHex(this.input[this.pointer + 1] as number) ||
            !isASCIIHex(this.input[this.pointer + 2] as number))
        ) {
          this.parseError = true;
        }

        if (!isNaN(c)) {
          this.url.path[0] += utf8PercentEncodeCodePoint(
            c,
            isC0ControlPercentEncode,
          );
        }
      }

      return true;
    }

    "parse query"(c: number, cStr: string) {
      if (
        !isSpecial(this.url) ||
        this.url.scheme === "ws" ||
        this.url.scheme === "wss"
      ) {
        this.encodingOverride = "utf-8";
      }

      if ((!this.stateOverride && c === p("#")) || isNaN(c)) {
        const queryPercentEncodePredicate = isSpecial(this.url)
          ? isSpecialQueryPercentEncode
          : isQueryPercentEncode;
        this.url.query += utf8PercentEncodeString(
          this.buffer,
          queryPercentEncodePredicate,
        );

        this.buffer = "";

        if (c === p("#")) {
          this.url.fragment = "";
          this.state = "fragment";
        }
      } else if (!isNaN(c)) {
        // TODO: If c is not a URL code point and not "%", parse error.

        if (
          c === p("%") &&
          (!isASCIIHex(this.input[this.pointer + 1] as number) ||
            !isASCIIHex(this.input[this.pointer + 2] as number))
        ) {
          this.parseError = true;
        }

        this.buffer += cStr;
      }

      return true;
    }

    "parse fragment"(c: number) {
      if (!isNaN(c)) {
        // TODO: If c is not a URL code point and not "%", parse error.
        if (
          c === p("%") &&
          (!isASCIIHex(this.input[this.pointer + 1] as number) ||
            !isASCIIHex(this.input[this.pointer + 2] as number))
        ) {
          this.parseError = true;
        }

        this.url.fragment += utf8PercentEncodeCodePoint(
          c,
          isFragmentPercentEncode,
        );
      }

      return true;
    }
  }

  function serializeURL(url: UrlObject, excludeFragment?: boolean) {
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

  function serializeURLOrigin(url: UrlObject): string {
    // https://url.spec.whatwg.org/#concept-url-origin
    switch (url.scheme) {
      case "blob":
        try {
          return serializeURLOrigin(parseURL(url.path[0]!)!);
        } catch (e) {
          // serializing an opaque origin returns "null"
          return "null";
        }
      case "ftp":
      case "http":
      case "https":
      case "ws":
      case "wss":
        return serializeOrigin({
          scheme: url.scheme,
          host: url.host!,
          port: url.port!,
        });
      case "file":
        /*
         * The spec says:
         * Unfortunate as it is, this is left as an exercise to the reader.
         * When in doubt, return a new opaque origin. Browsers tested so far:
         *
         * - Chrome says "file://", but treats file: URLs as cross-origin for
         *   most (all?) purposes; see e.g.
         *   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
         * - Firefox says "null", but treats file: URLs as same-origin
         *    sometimes based on directory stuff; see
         *   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs return "null";
         */
        return "null";
      default:
        // serializing an opaque origin returns "null"
        return "null";
    }
  }

  function basicURLParse(
    input: string,
    options?: {
      baseURL?: UrlObject | null;
      encodingOverride?: string;
      url?: UrlObject;
      stateOverride?: string;
    },
  ) {
    if (options === undefined) {
      options = {};
    }

    const usm = new URLStateMachine(
      input,
      options.baseURL,
      options.encodingOverride,
      options.url,
      options.stateOverride,
    );
    if (usm.failure) {
      return null;
    }

    return usm.url;
  }

  function setTheUsername(url: UrlObject, username: string) {
    url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode);
  }

  function setThePassword(url: UrlObject, password: string) {
    url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode);
  }

  function serializeInteger(integer: number) {
    return integer.toString();
  }

  function parseURL(
    input: string,
    options?: {
      baseURL?: UrlObject | null;
      encodingOverride?: string;
      url?: UrlObject;
      stateOverride?: string;
    },
  ) {
    if (options === undefined) {
      options = {};
    }

    // We don't handle blobs, so this just delegates:
    return basicURLParse(input, {
      baseURL: options.baseURL,
      encodingOverride: options.encodingOverride,
    });
  }

  // #endregion

  // #region URLSearchParams

  class URLSearchParams {
    static createInstanceNoStrip(
      init?:
        | URLSearchParams
        | string
        | Record<string, string | ReadonlyArray<string>>
        | Iterable<[string, string]>
        | ReadonlyArray<[string, string]>,
    ) {
      const instance = Object.create(URLSearchParams.prototype);
      instance._list = [];
      instance._url = null;
      instance.__initialize(init);
      return instance;
    }

    _list: Array<[string, string | readonly string[]]> = [];
    _url: null | URL = null;

    constructor(
      init?:
        | URLSearchParams
        | string
        | Record<string, string | ReadonlyArray<string>>
        | Iterable<[string, string]>
        | ReadonlyArray<[string, string]>,
    ) {
      if (typeof init === "string" && init[0] === "?") {
        init = init.slice(1);
      }

      this.__initialize(init);
    }

    private __initialize(
      init?:
        | URLSearchParams
        | string
        | Record<string, string | ReadonlyArray<string>>
        | Iterable<[string, string]>
        | ReadonlyArray<[string, string]>,
    ) {
      if (Array.isArray(init)) {
        for (const pair of init) {
          if (pair.length !== 2) {
            throw new TypeError(
              "Failed to construct 'URLSearchParams': parameter 1 sequence's element does not " +
                "contain exactly two elements.",
            );
          }
          this._list.push([pair[0], pair[1]]);
        }
      } else if (
        typeof init === "object" &&
        Object.getPrototypeOf(init) === null
      ) {
        for (const name of Object.keys(init)) {
          const value = (
            init as Record<string, string | ReadonlyArray<string>>
          )[name]!;
          this._list.push([name, value]);
        }
      } else {
        this._list = parseUrlencodedString(init as string);
      }
    }

    _updateSteps() {
      if (this._url !== null) {
        let query: string | null = serializeUrlencoded(this._list);
        if (query === "") {
          query = null;
        }
        this._url._url.query = query;
      }
    }

    append(name: string, value: string | readonly string[]) {
      this._list.push([name, value]);
      this._updateSteps();
    }

    delete(name: string) {
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i]![0] === name) {
          this._list.splice(i, 1);
        } else {
          i++;
        }
      }
      this._updateSteps();
    }

    get(name: string) {
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          return tuple[1];
        }
      }
      return null;
    }

    getAll(name: string) {
      const output = [];
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          output.push(tuple[1]);
        }
      }
      return output;
    }

    has(name: string) {
      for (const tuple of this._list) {
        if (tuple[0] === name) {
          return true;
        }
      }
      return false;
    }

    set(name: string, value: string | readonly string[]) {
      let found = false;
      let i = 0;
      while (i < this._list.length) {
        if (this._list[i]![0] === name) {
          if (found) {
            this._list.splice(i, 1);
          } else {
            found = true;
            this._list[i]![1] = value;
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

  // #endregion

  // #region URL

  class URL {
    _url: UrlObject;
    _query: URLSearchParams;

    constructor(url: string, base?: string | URL) {
      let parsedBase: UrlObject | null = null;
      if (base !== undefined) {
        parsedBase = basicURLParse(base as string);
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

      // We cannot invoke the "new URLSearchParams object" algorithm
      // without going through the constructor, which strips
      // question mark by default. Therefore the doNotStripQMark hack is used.
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
        stateOverride: "scheme start",
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
      basicURLParse(v!, { url: this._url, stateOverride: "path start" });
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
    [Symbol.toStringTag]: { value: "URL", configurable: true },
  });

  // #endregion

  return {
    URL,
    URLSearchParams,
  };
});
