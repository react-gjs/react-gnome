/**
 * Code stolen from:
 * https://github.com/browserify/path-browserify/blob/master/index.js
 *
 * MIT License
 *
 * Copyright (c) 2013 James Halliday
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
declare namespace posix_default {
    function resolve(...args: string[]): string;
    function normalize(path: string): string;
    function isAbsolute(path: string): boolean;
    function join(...args: string[]): string;
    function relative(from: string, to: string): string;
    function dirname(path: string): string;
    function basename(path: string, ext: string): string;
    function extname(path: string): string;
    function format(pathObject: string): string;
    function parse(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
    const sep = "/";
    const delimiter = ":";
    const win32: null;
    const posix: typeof posix_default;
}
export default posix_default;
export declare const resolve: typeof posix_default.resolve;
export declare const normalize: typeof posix_default.normalize;
export declare const isAbsolute: typeof posix_default.isAbsolute;
export declare const join: typeof posix_default.join;
export declare const relative: typeof posix_default.relative;
export declare const dirname: typeof posix_default.dirname;
export declare const basename: typeof posix_default.basename;
export declare const extname: typeof posix_default.extname;
export declare const format: typeof posix_default.format;
export declare const parse: typeof posix_default.parse;
export declare const sep = "/";
export declare const delimiter = ":";
export declare const win32: null;
export declare const posix: typeof posix_default;
