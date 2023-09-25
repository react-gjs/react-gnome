/**
 * Stolen from: https://github.com/nodejs/node/blob/main/lib/querystring.js
 *
 * Copyright Joyent, Inc. and other Node contributors.
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
declare namespace QueryString_default {
    function unescape(s: string, decodeSpaces?: boolean): string;
    /**
     * QueryString.escape() replaces encodeURIComponent()
     *
     * @see https://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3.4
     */
    function escape(str: any): string;
    function stringify(obj: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean> | null>, sep: string, eq: string, options: {
        encodeURIComponent?: (v: string) => string;
    }): string;
    const encode: typeof stringify;
    /**
     * Parse a key/val string.
     */
    function parse(qs: string, sep: string, eq: string, options: {
        maxKeys?: number;
        decodeURIComponent?(v: string): string;
    }): Record<string, string | string[]>;
    const decode: typeof parse;
}
export default QueryString_default;
export declare const decode: typeof QueryString_default.parse;
export declare const encode: typeof QueryString_default.stringify;
export declare const escape: typeof QueryString_default.escape;
export declare const parse: typeof QueryString_default.parse;
export declare const stringify: typeof QueryString_default.stringify;
export declare const unescape: typeof QueryString_default.unescape;
