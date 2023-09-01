/**
 * Code originally taken from
 * https://github.com/sonnyp/troll/blob/main/src/std/fetch.js and
 * written by [Sonny Piers](https://github.com/sonnyp)
 *
 * ISC License
 *
 * Copyright (c) 2021, Sonny Piers
 *
 * Permission to use, copy, modify, and/or distribute this
 * software for any purpose with or without fee is hereby
 * granted, provided that the above copyright notice and this
 * permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
 * WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL
 * THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
 * CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
 * SOFTWARE.
 */
declare function fetch(url: RequestInfo, options?: Partial<Request>): Promise<{
    status: number;
    statusText: string | null;
    ok: false;
    type: string;
    json(): Promise<never>;
    text(): Promise<never>;
    arrayBuffer(): Promise<never>;
    gBytes(): Promise<never>;
} | {
    status: number;
    statusText: string | null;
    ok: true;
    type: string;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBufferLike>;
}>;
export { fetch as fetch };
