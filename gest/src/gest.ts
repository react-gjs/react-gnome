import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=3.0";
import type { ExpectError, It, Test, TestHook } from "./gest-globals";

declare global {
  function print(text: string): void;
}

type SourceMap = {
  version: number;
  sources: string[];
  sourcesContent: string[];
  mappings: string;
  names: string[];
};

type TestUnit = {
  dirname: string;
  basename: string;
  filename: string;
  testFile: string;
  setupFile?: string;
};

type TestUnitInfo = {
  sourceFile: string;
  bundleFile: string;
  mapFile: string;
};

type GestConfig = {
  testDirectory: string;
  parallel: number;
  setup?: string;
};

class Command {
  private options: string[];
  private rawOptions: string[];

  constructor(private command: string, ...options: string[]) {
    this.rawOptions = options;
    this.options = this.sanitizeOptions(options);
  }

  private readOutput(
    stream: Gio.IDataInputStream,
    lineBuffer: string[],
    reject: (reason: any) => void
  ) {
    stream.read_line_async(0, null, (stream, res) => {
      try {
        if (stream) {
          const line = stream.read_line_finish_utf8(res)[0];

          if (line !== null) {
            lineBuffer.push(line);
            this.readOutput(stream, lineBuffer, reject);
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  private sanitizeOptions(options: string[]): string[] {
    return options.map((option) => {
      if (
        option.includes(" ") &&
        !option.startsWith('"') &&
        !option.endsWith('"')
      ) {
        return option.replace(/\s/g, "\\ ");
      }

      return option;
    });
  }

  private uint8ArrayToString(bytes: Uint8Array): string {
    let result = "";

    for (let i = 0; i < bytes.byteLength; i++) {
      result += String.fromCharCode(bytes[i]!);
    }

    return result;
  }

  private getFullCommand() {
    return this.command + " " + this.options.join(" ");
  }

  public runSync() {
    const [, stdout, stderr, status] = GLib.spawn_command_line_sync(
      this.getFullCommand()
    );

    if (status !== 0) {
      throw new Error(stderr ? this.uint8ArrayToString(stderr) : "");
    }

    return stdout ? this.uint8ArrayToString(stdout) : "";
  }

  public async run() {
    const [, pid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
      null,
      [this.command, ...this.rawOptions],
      null,
      GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
      null
    );

    if (stdin) GLib.close(stdin);

    if (!pid) throw new Error("Failed to run command");
    if (!stdout) throw new Error("Failed to get stdout");
    if (!stderr) throw new Error("Failed to get stderr");

    return new Promise<string>((resolve, reject) => {
      // const stdoutStream = new Gio.DataInputStream({
      //   base_stream: new Gio.UnixInputStream({
      //     fd: stdout,
      //     close_fd: true,
      //   }),
      //   close_base_stream: true,
      // });

      // const stdoutLines: string[] = [];
      // this.readOutput(stdoutStream, stdoutLines, reject);

      // const stderrStream = new Gio.DataInputStream({
      //   base_stream: new Gio.UnixInputStream({
      //     fd: stderr,
      //     close_fd: true,
      //   }),
      //   close_base_stream: true,
      // });

      // const stderrLines: string[] = [];
      // this.readOutput(stderrStream, stderrLines, reject);

      GLib.child_watch_add(GLib.PRIORITY_DEFAULT_IDLE, pid, (pid, status) => {
        // Ensure we close the remaining streams and process
        // const stdout = stdoutStream.read_line_utf8(null);
        // const stderr = stderrStream.read_line_utf8(null);

        // stderrStream.close(null);
        // stdoutStream.close(null);

        GLib.spawn_close_pid(pid);

        if (status === 0) {
          resolve("");
        } else {
          reject(new Error("Command failed"));
        }
      });
    });
  }
}
const cwd = new Command("pwd").runSync().trim();

const escape = "\u001b";

const Bold = `${escape}[1m`;

class TermColor {
  protected static parseRgbArgs(args: any[]): {
    r: number;
    g: number;
    b: number;
  } {
    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === "string") {
        if (arg.startsWith("rgb(")) {
          const rgb = arg.slice(4, -1).split(",");
          return {
            r: Number(rgb[0]!),
            g: Number(rgb[1]!),
            b: Number(rgb[2]!),
          };
        } else if (arg.startsWith("#")) {
          const rgb = arg.slice(1).split("");
          return {
            r: parseInt(rgb[0]! + rgb[1]!, 16),
            g: parseInt(rgb[2]! + rgb[3]!, 16),
            b: parseInt(rgb[4]! + rgb[5]!, 16),
          };
        }
      } else if (typeof arg === "object") {
        return arg as { r: number; g: number; b: number };
      }
    } else if (args.length === 3) {
      return { r: args[0], g: args[1], b: args[2] };
    }

    throw new Error("Invalid arguments");
  }

  static define(name: string, color: string): void {}

  static rgb(...args: any[]): string {
    return "";
  }

  static get(color: string): string {
    if (color in this) {
      return (this as any)[color];
    } else {
      return this.rgb(color);
    }
  }
}

class TermFontColor extends TermColor {
  static reset = `${escape}[0m`;
  static red = `${escape}[31m`;
  static green = `${escape}[32m`;
  static yellow = `${escape}[33m`;
  static blue = `${escape}[34m`;
  static magenta = `${escape}[35m`;
  static cyan = `${escape}[36m`;
  static white = `${escape}[37m`;
  static lightRed = `${escape}[91m`;
  static lightGreen = `${escape}[92m`;
  static lightYellow = `${escape}[93m`;
  static lightBlue = `${escape}[94m`;
  static lightMagenta = `${escape}[95m`;
  static lightCyan = `${escape}[96m`;
  static lightWhite = `${escape}[97m`;

  static rgb(c: `#${string}` | `rgb(${string})`): string;
  static rgb(c: { r: number; g: number; b: number }): string;
  static rgb(r: number, g: number, b: number): string;
  static rgb(...args: any[]): string {
    const rgb = this.parseRgbArgs(args);

    return `${escape}[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }

  static define(name: string, color: `#${string}` | `rgb(${string})`): void {
    Object.assign(this, { [name]: this.rgb(color) });
  }
}

class TermBgColor extends TermColor {
  static reset = `${escape}[0m`;
  static red = `${escape}[41m`;
  static green = `${escape}[42m`;
  static yellow = `${escape}[43m`;
  static blue = `${escape}[44m`;
  static magenta = `${escape}[45m`;
  static cyan = `${escape}[46m`;
  static white = `${escape}[47m`;
  static lightRed = `${escape}[101m`;
  static lightGreen = `${escape}[102m`;
  static lightYellow = `${escape}[103m`;
  static lightBlue = `${escape}[104m`;
  static lightMagenta = `${escape}[105m`;
  static lightCyan = `${escape}[106m`;
  static lightWhite = `${escape}[107m`;

  static rgb(c: `#${string}` | `rgb(${string})`): string;
  static rgb(c: { r: number; g: number; b: number }): string;
  static rgb(r: number, g: number, b: number): string;
  static rgb(...args: any[]): string {
    const rgb = this.parseRgbArgs(args);

    return `${escape}[48;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }

  static define(name: string, color: `#${string}` | `rgb(${string})`): void {
    Object.assign(this, { [name]: this.rgb(color) });
  }
}

class TermMarkupFormatter {
  private static parseTagAttributes(
    tag: string
  ): Map<string, string | boolean> {
    const attributes = new Map<string, string | boolean>();

    const attributesListString = tag.slice(2, -1);
    const attributesStrings = attributesListString.split(" ");

    for (const [name, value] of attributesStrings.map((s) => s.split("="))) {
      if (value !== undefined) {
        attributes.set(name!, value.slice(1, -1));
      } else {
        attributes.set(name!, true);
      }
    }

    return attributes;
  }

  private findNextMarkupTag(
    text: string,
    start: number
  ): { startIndex: number; endIndex: number } {
    let startIndex = text.indexOf("<", start);
    if (startIndex === -1) {
      return { startIndex: -1, endIndex: -1 };
      // startIndex = text.indexOf("</p>", start);

      // if (startIndex === -1) {
      //   return { startIndex: -1, endIndex: -1 };
      // }
    }

    const endIndex = text.indexOf(">", startIndex);

    return { startIndex, endIndex };
  }

  static format(text: string): string {
    const tracker = new TermMarkupFormatter();

    let result = "";
    let offset = 0;

    while (true) {
      const { startIndex, endIndex } = tracker.findNextMarkupTag(text, offset);

      if (startIndex === -1) {
        break;
      }

      result += text.slice(offset, startIndex);

      const tag = text.slice(startIndex, endIndex + 1);

      if (tag === "</p>") {
        tracker.exitScope();
        const currentScope = tracker.currentScope;
        let formats: string[] = [];

        if (currentScope.bold) {
          formats.push(Bold);
        }
        if (currentScope.bg) {
          formats.push(currentScope.bg);
        }
        if (currentScope.color) {
          formats.push(currentScope.color);
        }

        result += `${TermFontColor.reset}${formats.join("")}`;
      }

      const attributes = TermMarkupFormatter.parseTagAttributes(tag);

      const colorAttrib = attributes.get("color");
      const boldAttrib = attributes.get("bold");
      const bgAttrib = attributes.get("bg");

      if (colorAttrib || boldAttrib || bgAttrib) {
        const scope: {
          color?: string | undefined;
          bg?: string | undefined;
          bold?: boolean | undefined;
        } = {};

        if (boldAttrib) {
          scope.bold = true;
          result += Bold;
        }

        if (typeof bgAttrib === "string") {
          const bg = TermBgColor.get(bgAttrib);
          scope.bg = bg;
          result += bg;
        }

        if (typeof colorAttrib === "string") {
          const color = TermFontColor.get(colorAttrib);
          scope.color = color;
          result += color;
        }

        tracker.enterScope(scope);
      }

      offset = endIndex + 1;
    }

    result += text.slice(offset);

    if (tracker.scopeStack.length > 0) {
      result += TermFontColor.reset;
    }

    return result;
  }

  private constructor() {}

  private scopeStack: { color?: string; bg?: string; bold?: boolean }[] = [];
  private currentScope: { color?: string; bg?: string; bold?: boolean } = {};

  private enterScope(scope: { color?: string; bg?: string; bold?: boolean }) {
    this.scopeStack.push(scope);
    this.currentScope = scope;
  }

  private exitScope() {
    this.scopeStack.pop();
    this.currentScope = this.scopeStack[this.scopeStack.length - 1] ?? {};
  }
}

class Output {
  static print(text: string) {
    try {
      const formatted = TermMarkupFormatter.format(text);
      print(formatted);
    } catch (e) {
      console.warn(e);
    }
  }
}

class OutputBuffer {
  private lines: string[] = [];

  private appendToLastLine(text: string) {
    const lastLine = this.lines.pop();
    if (lastLine) {
      this.lines.push(lastLine + text);
    } else {
      this.lines.push(text);
    }
  }

  print(...text: string[]) {
    this.appendToLastLine(text.join(""));
  }

  println(text: string) {
    this.lines.push(text);
  }

  flush() {
    if (this.lines.length === 0) return;
    const text = this.lines.join("\n");
    Output.print(text);
    this.lines = [];
  }

  pipeTo(output: OutputBuffer) {
    if (this.lines.length === 0) return;
    output.lines.push(...this.lines);
    this.lines = [];
  }
}

class Base64VLQ {
  char_to_integer: Record<string, number> = {};
  integer_to_char: Record<number, string> = {};

  constructor() {
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
      .split("")
      .forEach((char, i) => {
        this.char_to_integer[char] = i;
        this.integer_to_char[i] = char;
      });
  }

  decode(string: string): [number, number, number, number, number | undefined] {
    let result = [];

    let shift = 0;
    let value = 0;

    for (let i = 0; i < string.length; i += 1) {
      const char = string[i]!;
      let integer = this.char_to_integer[char];

      if (integer === undefined) {
        throw new Error("Invalid character (" + string[i] + ")");
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
          result.push(value === 0 ? -0x80000000 : -value);
        } else {
          result.push(value);
        }

        // reset
        value = shift = 0;
      }
    }

    return result as [number, number, number, number, number | undefined];
  }

  encode(value: number | number[]) {
    if (typeof value === "number") {
      return this.encode_integer(value);
    }

    let result = "";
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i]!;
      result += this.encode_integer(char);
    }

    return result;
  }

  encode_integer(num: number) {
    let result = "";

    if (num < 0) {
      num = (-num << 1) | 1;
    } else {
      num <<= 1;
    }

    do {
      let clamped = num & 31;
      num >>>= 5;

      if (num > 0) {
        clamped |= 32;
      }

      result += this.integer_to_char[clamped];
    } while (num > 0);

    return result;
  }
}

class SourceMapReader {
  private converter = new Base64VLQ();

  constructor(private map: SourceMap) {}

  protected getLineN(text: string, n: number) {
    let line = 0;
    let lineStart = 0;

    while (line !== n) {
      lineStart = text.indexOf("\n", lineStart) + 1;
      line++;
    }

    if (line > 0 && lineStart === 0) {
      return "";
    }

    let lineEnd = text.indexOf("\n", lineStart + 1);

    if (lineEnd === -1) {
      lineEnd = text.length;
    }

    return text.slice(lineStart, lineEnd);
  }

  getOriginalPosition(outLine: number, outColumn: number) {
    // SourceMap is 0 based, error stack is 1 based
    outLine -= 1;
    outColumn -= 1;

    const vlqs = this.map.mappings.split(";").map((line) => line.split(","));

    const state: [number, number, number, number, number] = [0, 0, 0, 0, 0];

    if (vlqs.length <= outLine) return null;

    for (const [index, line] of vlqs.entries()) {
      state[0] = 0;

      for (const [_, segment] of line.entries()) {
        if (!segment) continue;
        const segmentCords = this.converter.decode(segment);

        const prevState: typeof state = [...state];

        state[0] += segmentCords[0];

        if (segmentCords.length > 1) {
          state[1] += segmentCords[1];
          state[2] += segmentCords[2];
          state[3] += segmentCords[3];
          if (segmentCords[4] !== undefined) state[4] += segmentCords[4];

          if (index === outLine) {
            if (prevState[0] < outColumn && outColumn <= state[0]) {
              return {
                file: this.map.sources[state[1]],
                line: state[2] + 1, // back to 1 based
                column: outColumn + state[3] - state[0] + 1, // back to 1 based
              };
            }
          }
        }
      }

      if (index === outLine) {
        return {
          file: this.map.sources[state[1]],
          line: state[2] + 1, // back to 1 based
          column: 1,
        };
      }
    }

    return null;
  }
}

class NoLogError extends Error {
  static isError(err: unknown): err is Error {
    return typeof err === "object" && !!err && err instanceof Error;
  }

  constructor(originalError: unknown, message: string) {
    super(NoLogError.isError(originalError) ? originalError.message : message);
    this.name = "NoLogError";
  }
}

function _getArgValue(args: string[], ...argNames: string[]) {
  for (const argName of argNames) {
    const argIndex = args.indexOf(argName);
    if (argIndex === -1) {
      continue;
    }

    const argValue = args[argIndex + 1];
    if (argValue === undefined) {
      continue;
    }

    return argValue;
  }

  return undefined;
}

function _leftPad(str: string, len: number, char = " ") {
  const pad = char.repeat(len);
  return pad + str.replaceAll("\n", "\n" + pad);
}

function _async<T = void>(
  callback: (promise: { resolve(v: T): void; reject(e: any): void }) => void
) {
  return new Promise<T>(async (resolve, reject) => {
    try {
      await callback({ resolve, reject });
    } catch (err) {
      reject(err);
    }
  });
}

function _normalizeStringPosix(path: string, allowAboveRoot: boolean) {
  var res = "";
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);
    else if (code === 47 /*/*/) break;
    else code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== 46 /*.*/ ||
          res.charCodeAt(res.length - 2) !== 46 /*.*/
        ) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += "/..";
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += "/" + path.slice(lastSlash + 1, i);
        else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _normalize(path: string) {
  if (path.length === 0) return ".";

  var isAbsolute = path.charCodeAt(0) === 47; /*/*/
  var trailingSeparator = path.charCodeAt(path.length - 1) === 47; /*/*/

  // Normalize the path
  path = _normalizeStringPosix(path, !isAbsolute);

  if (path.length === 0 && !isAbsolute) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";

  if (isAbsolute) return "/" + path;
  return path;
}

function _join(...args: string[]) {
  if (args.length === 0) return ".";
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i] as string;
    if (arg.length > 0) {
      if (joined === undefined) joined = arg;
      else joined += "/" + arg;
    }
  }
  if (joined === undefined) return ".";
  return _normalize(joined);
}

async function _readFile(path: string) {
  return _async<string>((p) => {
    const encoding = "utf-8";

    const file = Gio.File.new_for_path(path.toString());

    file.load_contents_async(null, (_, result) => {
      try {
        const [success, contents] = file.load_contents_finish(result);
        if (success) {
          const decoder = new TextDecoder(encoding);
          p.resolve(decoder.decode(contents as any));
        } else {
          p.reject(new Error("Could not read file."));
        }
      } catch (error) {
        p.reject(error);
      }
    });
  });
}

async function _deleteFile(path: string) {
  return _async((p) => {
    const file = Gio.File.new_for_path(path);

    file.delete_async(GLib.PRIORITY_DEFAULT, null, (_, result) => {
      try {
        if (!file.delete_finish(result)) {
          throw new Error(`Failed to delete file: ${path}`);
        }
        p.resolve(undefined);
      } catch (error) {
        p.reject(error);
      }
    });
  });
}

function _isTest(t: any): t is Test {
  return t && typeof t === "object" && t.name && t.line !== undefined;
}

function _isExpectError(e: any): e is ExpectError {
  return e && typeof e === "object" && e.name === "ExpectError";
}

function _getErrorMessage(e: unknown) {
  if (typeof e === "string") return e;
  if (typeof e === "object" && !!e && e instanceof Error) return e.message;
  return String(e);
}

function _getErrorStack(e: unknown, sourceMap?: SourceMap) {
  if (typeof e === "object" && !!e && e instanceof Error) {
    const stack = e.stack;
    if (stack) {
      if (!sourceMap) return stack;

      const lines = stack.split("\n");
      const result: string[] = [];

      const sourceMapReader = new SourceMapReader(sourceMap);

      for (const line of lines) {
        if (!line.includes("bundled.js")) {
          result.push(line);
          continue;
        }

        const match = line.match(/(.*):(\d+):(\d+)$/);

        if (match) {
          const [, , line, column] = match;
          const mapped = sourceMapReader.getOriginalPosition(+line!, +column!);
          if (mapped) {
            result.push(`${mapped.file}:${mapped.line}:${mapped.column}`);
          } else {
            result.push(line!);
          }
        } else {
          result.push(line);
        }
      }

      return result.join("\n");
    }
  }
  return "";
}

function _hasProperties<K extends string>(
  o: object,
  ...p: K[]
): o is Record<K, unknown> {
  for (const key of p) {
    if (!Object.prototype.hasOwnProperty.call(o, key)) return false;
  }
  return true;
}

async function _readdir(dir: string) {
  const file = Gio.File.new_for_path(dir);

  const enumerator = await _async<Gio.FileEnumerator>((p2) => {
    file.enumerate_children_async(
      "*",
      Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          const enumerator = file.enumerate_children_finish(result);
          p2.resolve(enumerator);
        } catch (error) {
          p2.reject(error);
        }
      }
    );
  });

  const getNextBatch = () =>
    _async<Gio.FileInfo[]>((p3) => {
      enumerator.next_files_async(
        50, // max results
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            p3.resolve(enumerator.next_files_finish(result));
          } catch (e) {
            p3.reject(e);
          }
        }
      );
    });

  const allFile: string[] = [];

  let nextBatch: Gio.FileInfo[] = [];

  while ((nextBatch = await getNextBatch()).length > 0) {
    allFile.push(...nextBatch.map((f) => f.get_name()));
  }

  return allFile;
}

async function _walkFiles(
  dir: string,
  onFile: (root: string, name: string) => void
) {
  const file = Gio.File.new_for_path(dir);

  const enumerator = await _async<Gio.FileEnumerator>((p2) => {
    file.enumerate_children_async(
      "*",
      Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          const enumerator = file.enumerate_children_finish(result);
          p2.resolve(enumerator);
        } catch (error) {
          p2.reject(error);
        }
      }
    );
  });

  const getNextBatch = () =>
    _async<Gio.FileInfo[]>((p3) => {
      enumerator.next_files_async(
        50, // max results
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            p3.resolve(enumerator.next_files_finish(result));
          } catch (e) {
            p3.reject(e);
          }
        }
      );
    });

  let nextBatch: Gio.FileInfo[] = [];

  while ((nextBatch = await getNextBatch()).length > 0) {
    for (const child of nextBatch) {
      const isDir = child.get_file_type() === Gio.FileType.DIRECTORY;
      if (!isDir) {
        onFile(dir, child.get_name());
      } else {
        await _walkFiles(_join(dir, child.get_name()), onFile);
      }
    }
  }
}

async function _buildFile(params: {
  input: string;
  output: string;
  mainSetup?: string;
  fileSetup?: string;
}) {
  const { input, output, mainSetup, fileSetup } = params;

  const args = [
    "/home/owner/Documents/react-gtk/gest/dist/esm/test-builder.mjs",
    input,
    output,
  ];

  if (mainSetup) {
    args.push(mainSetup);
  }

  if (fileSetup) {
    args.push(fileSetup);
  }

  const cmd = new Command("node", ...args);

  await cmd.runSync();
}

type RunnerTestOutputs = {
  err: OutputBuffer;
  info: OutputBuffer;
};

type TestRunnerOptions = {
  verbose?: boolean;
  testNamePattern?: string;
  testFilePattern?: string;
};

class TestRunner {
  private options: TestRunnerOptions = {};

  private get verbose() {
    return this.options.verbose ?? false;
  }

  success: boolean = true;
  mainOutput = new OutputBuffer();
  testErrorOutputs: OutputBuffer[] = [];

  constructor(private testFileQueue: TestUnit[], private mainSetup?: string) {}

  makePath(parentList: string[]) {
    return parentList
      .map((n) => `"${n}"`)
      .join(/* html */ `<p bold color="white"> > </p>`);
  }

  private testNameMatches(name: string) {
    const { testNamePattern } = this.options;
    if (!testNamePattern) return true;
    return name.match(testNamePattern) !== null;
  }

  private testFileMatches(name: string) {
    const { testFilePattern } = this.options;
    if (!testFilePattern) return true;
    return name.match(testFilePattern) !== null;
  }

  private async getSourceMapFileContent(filePath: string) {
    try {
      const fileContent = await _readFile(filePath);
      return JSON.parse(fileContent);
    } catch {
      return undefined;
    }
  }

  async getLocationFromMap(info: TestUnitInfo, line: number, column: number) {
    try {
      const fileContent = await _readFile(info.mapFile);
      const map = JSON.parse(fileContent);
      const sourceReader = new SourceMapReader(map);
      return sourceReader.getOriginalPosition(line, column);
    } catch (e) {
      return null;
    }
  }

  async runHook(hook: TestHook, info: TestUnitInfo, output: RunnerTestOutputs) {
    try {
      await hook.callback();
    } catch (e) {
      const location = await this.getLocationFromMap(
        info,
        hook.line,
        hook.column
      );

      output.err.println(
        /* html */ `<p bold bg="customBlack" color="red">An error occurred when running a lifecycle hook:</p>`
      );
      output.err.println(_getErrorMessage(e));
      output.err.println(
        /* html */ `<p color="#FFFFFF">${info.sourceFile}${
          location ? `:${location?.line}:${location?.column}` : ""
        }</p>`
      );

      throw new NoLogError(e, "Hook error");
    }
  }

  async runTestCase(
    testCase: It,
    info: TestUnitInfo,
    parentList: string[],
    output: RunnerTestOutputs
  ) {
    const testPath = this.makePath([...parentList, testCase.name]);
    try {
      if (!this.testNameMatches(testPath)) {
        if (this.verbose) {
          output.info.println(
            /* html */ `   [-] <p color="yellow">${testPath}</p>`
          );
        }
        return true;
      }
      await testCase.callback();
      output.info.println(/* html */ `   [✓] <p color="green">${testPath}</p>`);
      return true;
    } catch (e) {
      output.info.println(
        /* html */ `   [✗] <p color="lightRed">${testPath}</p>`
      );
      if (_isExpectError(e)) {
        e.handle();
        const location = await this.getLocationFromMap(info, e.line, e.column);
        output.err.println(
          /* html */ `<p bold bg="customBlack" color="red">${testPath}</p>`
        );
        output.err.println(_leftPad(e.message, 4));
        output.err.println(
          /* html */ `<p color="#FFFFFF">${info.sourceFile}${
            location ? `:${location?.line}:${location?.column}` : ""
          }</p>`
        );
        this.success = false;
      } else {
        const location = await this.getLocationFromMap(
          info,
          testCase.line,
          testCase.column
        );
        output.err.println(
          /* html */ `<p bold bg="customBlack" color="red">${testPath}</p>`
        );
        output.err.println(_leftPad(_getErrorMessage(e), 4));
        output.err.println(
          _leftPad(
            _getErrorStack(e, await this.getSourceMapFileContent(info.mapFile)),
            6
          )
        );
        output.err.println(
          /* html */ `<p color="#FFFFFF">${info.sourceFile}${
            location ? `:${location?.line}:${location?.column}` : ""
          }</p>`
        );
        this.success = false;
      }
      return false;
    }
  }

  async runTest(
    test: Test,
    info: TestUnitInfo,
    parentList: string[] = [],
    output: RunnerTestOutputs
  ): Promise<boolean> {
    let passed = true;

    try {
      for (const hook of test.beforeAll) {
        await this.runHook(hook, info, output);
      }

      for (const testCase of test.its) {
        for (const hook of test.beforeEach) {
          await this.runHook(hook, info, output);
        }

        const result = await this.runTestCase(
          testCase,
          info,
          parentList.concat(test.name),
          output
        );

        passed &&= result;

        for (const hook of test.afterEach) {
          await this.runHook(hook, info, output);
        }
      }

      for (const subTest of test.subTests) {
        const result = await this.runTest(
          {
            ...subTest,
            beforeEach: [...test.beforeEach, ...subTest.beforeEach],
            afterEach: [...test.afterEach, ...subTest.afterEach],
          },
          info,
          parentList.concat(test.name),
          output
        );
        passed &&= result;
      }

      for (const hook of test.afterAll) {
        await this.runHook(hook, info, output);
      }
    } catch (e) {
      this.success = false;

      if (NoLogError.isError(e) && e instanceof NoLogError) {
        return false;
      }

      const testPath = this.makePath(parentList.concat(test.name));

      output.err.println(/* html */ `<p bold color="green">${testPath}</p>`);
      output.err.println(
        /* html */ `<p color="red">Test failed due to an error:</p>`
      );
      output.err.println(
        /* html */ `<p color="rgb(180, 180, 180)">${_leftPad(
          _getErrorMessage(e),
          4
        )}</p>`
      );

      return false;
    }

    return passed;
  }

  async nextUnit() {
    if (this.testFileQueue.length === 0) return false;

    const testUnit = this.testFileQueue.pop() as TestUnit;
    const outputFile = testUnit.testFile + ".bundled.js";

    const mapFile = outputFile + ".map";
    const isOutputAbsolute = outputFile.startsWith("/");
    const importPath =
      "file://" + (isOutputAbsolute ? outputFile : _join(cwd, outputFile));

    const relativePath =
      "." +
      importPath.replace("file://" + cwd, "").replace(/\.bundled\.js$/, "");

    try {
      if (!this.testFileMatches(testUnit.testFile)) {
        if (this.verbose) {
          this.mainOutput.println(
            /* html */ `[-] <p bold color="yellow">${relativePath}</p> <p bold color="white" bg="lightYellow">SKIPPED</p>`
          );
        }
        return true;
      }

      await _buildFile({
        input: testUnit.testFile,
        output: outputFile,
        fileSetup: testUnit.setupFile,
        mainSetup: this.mainSetup,
      });

      await _async((p) => {
        import(importPath)
          .then(async (module) => {
            const test = module.default;

            if (_isTest(test)) {
              const errTestOutput = new OutputBuffer();
              const infoTestOutput = new OutputBuffer();

              this.testErrorOutputs.push(errTestOutput);

              const passed = await this.runTest(
                test,
                {
                  sourceFile: testUnit.testFile,
                  bundleFile: outputFile,
                  mapFile: mapFile,
                },
                undefined,
                {
                  err: errTestOutput,
                  info: infoTestOutput,
                }
              );

              await _deleteFile(outputFile);
              await _deleteFile(mapFile);

              if (passed) {
                this.mainOutput.println(
                  /* html */ `[✓] <p bold color="green">${relativePath}</p> <p bold color="white" bg="lightGreen">PASSED</p>`
                );
              } else {
                this.mainOutput.println(
                  /* html */ `[✘] <p bold color="red">${relativePath}</p> <p bold color="white" bg="lightRed">FAILED</p>`
                );
              }

              if (this.verbose) infoTestOutput.pipeTo(this.mainOutput);

              p.resolve();
            } else {
              await _deleteFile(outputFile);
              await _deleteFile(mapFile);

              p.reject(new Error(`Not a test: ${testUnit.testFile}`));
            }
          })
          .catch(p.reject);
      });
    } catch (e) {
      this.success = false;
      this.mainOutput.println(
        /* html */ `<p color="red">Failed to start a test:</p> "${testUnit.testFile}"`
      );
      this.mainOutput.println(_getErrorMessage(e));
    } finally {
      this.mainOutput.flush();
    }

    return true;
  }

  async start() {
    while (await this.nextUnit()) {}
  }

  setOptions(options: TestRunnerOptions) {
    Object.assign(this.options, options);
    return this;
  }
}

async function loadConfig() {
  const files = await _readdir(cwd);

  if (files.includes("gest.config.json")) {
    const configText = await _readFile(_join(cwd, "gest.config.json"));
    const config = JSON.parse(configText);

    let isValid = false;

    if (typeof config === "object") {
      if (_hasProperties(config, "testDirectory", "parallel")) {
        if (
          typeof config.testDirectory === "string" &&
          typeof config.parallel === "number"
        ) {
          isValid = true;
        }
      }

      if (_hasProperties(config, "setup")) {
        if (typeof config.setup !== "string") {
          isValid = false;
        }
      }
    }

    if (isValid) {
      return config as GestConfig;
    } else {
      Output.print(
        /* html */ `<p color="yellow">Invalid config file. Using default config instead.</p>`
      );
    }
  }
}

async function main() {
  try {
    // @ts-expect-error
    const pargs: string[] = imports.system.programArgs;

    if (pargs.includes("--help") || pargs.includes("-h")) {
      Output.print(/* html */ `<p bold>gest</p>
<p>A simple test runner for Gnome JavaScript</p>

<p>Usage: gest [options]</p>

<p>Options:</p>
<p>  -h, --help</p>
<p>  -v, --verbose</p>
<p>  -t, --testNamePattern [regex]</p>
<p>  -p, --testPathPattern [regex]</p>
`);

      return;
    }

    const testNamePattern = _getArgValue(pargs, "-t", "--testNamePattern");
    const testFilePattern = _getArgValue(pargs, "-p", "--testPathPattern");

    const options: TestRunnerOptions = {
      verbose: pargs.includes("--verbose") || pargs.includes("-v"),
      testNamePattern,
      testFilePattern,
    };

    const config = await loadConfig();

    const testsDir = config?.testDirectory ?? "./__tests__";
    const parallel = config?.parallel ?? 4;

    const testFileMatcher = /.*\.test\.(m|c){0,1}(ts|js|tsx|jsx)$/;
    const setupFileMatcher = /.*\.setup\.(m|c){0,1}js$/;

    const testFiles: TestUnit[] = [];

    await _walkFiles(testsDir, (root, name) => {
      if (testFileMatcher.test(name)) {
        testFiles.push({
          dirname: root,
          filename: name,
          basename: name.replace(/\.test\.(m|c){0,1}(ts|js|tsx|jsx)$/, ""),
          testFile: _join(root, name),
        });
      }
    });

    await _walkFiles(testsDir, (root, name) => {
      if (setupFileMatcher.test(name)) {
        const basename = name.replace(
          /\.setup\.(m|c){0,1}(ts|js|tsx|jsx)$/,
          ""
        );
        const unit = testFiles.find(
          (unit) => unit.basename === basename && unit.dirname === root
        );

        if (unit) {
          unit.setupFile = _join(root, name);
        }
      }
    });

    const testRunners = Array.from({ length: parallel }, () =>
      new TestRunner(testFiles, config?.setup).setOptions(options)
    );

    await Promise.all(testRunners.map((runner) => runner.start()));

    if (testRunners.some((runner) => !runner.success)) {
      print("");

      for (const runner of testRunners) {
        for (const errOutput of runner.testErrorOutputs) {
          errOutput.flush();
        }
      }

      Output.print(/* html */ `\n<p color="red">Tests have failed.</p>`);
    } else {
      Output.print(/* html */ `\n<p color="green">All tests have passed.</p>`);
    }
  } catch (e) {
    Output.print(/* html */ `\n<p color="red">${_getErrorMessage(e)}</p>`);
  } finally {
    Gtk.main_quit();
  }
}

TermBgColor.define("customBlack", "#1b1c26");

Gtk.init(null);
setTimeout(() => {
  main();
}, 0);
Gtk.main();
