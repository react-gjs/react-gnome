import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk?version=3.0";
import type { ExpectError, It, Test, TestHook } from "./gest-globals";

type SourceMap = {
  version: number;
  sources: string[];
  sourcesContent: string[];
  mappings: string;
  names: string[];
};

type TestUnitInfo = {
  sourceFile: string;
  bundleFile: string;
  mapFile: string;
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

  getOriginalPosition(outLine: number, outColumn: number) {
    const vlqs = this.map.mappings.split(";").map((line) => line.split(","));

    const state: [number, number, number, number, number] = [0, 0, 0, 0, 0];

    if (vlqs.length <= outLine) return null;

    for (const [index, line] of vlqs.entries()) {
      state[0] = 0;

      for (const segment of line) {
        if (!segment) continue;

        const segmentCords = this.converter.decode(segment);

        const prevState: typeof state = [...state];

        state[0] += segmentCords[0];
        state[1] += segmentCords[1];
        state[2] += segmentCords[2];
        state[3] += segmentCords[3];
        if (segmentCords[4] !== undefined) state[4] += segmentCords[4];

        if (index === outLine) {
          if (prevState[0] <= outColumn && outColumn <= state[0]) {
            return {
              file: this.map.sources[state[1]],
              line: state[2],
              column: state[3],
            };
          }
        }
      }

      if (index === outLine) {
        return {
          file: this.map.sources[state[1]],
          line: state[2],
          column: state[3],
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

const cwd = new Command("pwd").runSync().trim();

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

const _readFile = async (path: string) => {
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
};

const _deleteFile = async (path: string) => {
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
};

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

async function _buildFile(input: string, output: string) {
  const cmd = new Command(
    "node",
    "/home/owner/Documents/react-gtk/gest/dist/esm/test-builder.mjs",
    input,
    output
  );

  await cmd.runSync();
}

class TestRunner {
  success: boolean = true;

  constructor(private testFileQueue: string[]) {}

  makePath(parentList: string[]) {
    return parentList.map((n) => `"${n}"`).join(" > ");
  }

  async getLocationFromMap(info: TestUnitInfo, line: number, column: number) {
    try {
      const fileContent = await _readFile(info.mapFile);
      const map = JSON.parse(fileContent);
      const sourceReader = new SourceMapReader(map);
      return sourceReader.getOriginalPosition(line, column);
    } catch (e) {
      console.log(e);

      return null;
    }
  }

  async runHook(hook: TestHook, info: TestUnitInfo) {
    try {
      await hook.callback();
    } catch (e) {
      const location = await this.getLocationFromMap(
        info,
        hook.line,
        hook.column
      );

      console.error(
        `\nAn error occurred when running a lifecycle hook:\n`,
        _getErrorMessage(e),
        `\n\n${info.sourceFile}${
          location ? `:${location?.line}:${location?.column}` : ""
        }`
      );

      throw new NoLogError(e, "Hook error");
    }
  }

  async runTestCase(testCase: It, info: TestUnitInfo, parentList: string[]) {
    try {
      await testCase.callback();
    } catch (e) {
      if (_isExpectError(e)) {
        e.handle();
        const location = await this.getLocationFromMap(info, e.line, e.column);
        console.warn(
          "\n",
          this.makePath(parentList),
          `\nTest case failed:\n`,
          e.message,
          `\n\n${info.sourceFile}${
            location ? `:${location?.line}:${location?.column}` : ""
          }`
        );
        this.success = false;
      } else {
        const location = await this.getLocationFromMap(
          info,
          testCase.line,
          testCase.column
        );
        console.warn(
          "\n",
          this.makePath(parentList),
          `\nTest case failed:\n`,
          _getErrorMessage(e),
          `\n\n${info.sourceFile}${
            location ? `:${location?.line}:${location?.column}` : ""
          }`
        );
        this.success = false;
        throw e;
      }
    }
  }

  async runTest(test: Test, info: TestUnitInfo, parentList: string[] = []) {
    try {
      for (const hook of test.beforeAll) {
        await this.runHook(hook, info);
      }

      for (const testCase of test.its) {
        for (const hook of test.beforeEach) {
          await this.runHook(hook, info);
        }

        await this.runTestCase(testCase, info, parentList.concat(test.name));

        for (const hook of test.afterEach) {
          await this.runHook(hook, info);
        }
      }

      for (const subTest of test.subTests) {
        await this.runTest(
          {
            ...subTest,
            beforeEach: [...test.beforeEach, ...subTest.beforeEach],
            afterEach: [...test.afterEach, ...subTest.afterEach],
          },
          info,
          parentList.concat(test.name)
        );
      }

      for (const hook of test.afterAll) {
        await this.runHook(hook, info);
      }
    } catch (e) {
      this.success = false;

      if (NoLogError.isError(e) && e instanceof NoLogError) {
        return;
      }

      console.error(
        "\n",
        this.makePath(parentList.concat(test.name)),
        "\nTest failed due to an error:\n\n",
        _getErrorMessage(e),
        "\n"
      );
    }
  }

  async nextUnit() {
    if (this.testFileQueue.length === 0) return false;

    const testFile = this.testFileQueue.pop() as string;
    const outputFile = testFile + ".bundled.js";

    try {
      await _buildFile(testFile, outputFile);

      const mapFile = outputFile + ".map";
      const isOutputAbsolute = outputFile.startsWith("/");
      const importPath =
        "file://" + (isOutputAbsolute ? outputFile : _join(cwd, outputFile));

      await _async((p) => {
        import(importPath)
          .then(async (module) => {
            const test = module.default;

            if (_isTest(test)) {
              console.log(`Running Test Suite: "${test.name}"`);

              await this.runTest(test, {
                sourceFile: testFile,
                bundleFile: outputFile,
                mapFile: mapFile,
              });

              await _deleteFile(outputFile);
              await _deleteFile(mapFile);

              p.resolve();
            } else {
              await _deleteFile(outputFile);
              await _deleteFile(mapFile);

              p.reject(new Error(`Not a test: ${testFile}`));
            }
          })
          .catch(p.reject);
      });
    } catch (e) {
      this.success = false;
      console.error(`Failed to start a test:\n${testFile}`, e);
    }

    return true;
  }

  async start() {
    while (await this.nextUnit()) {}
  }
}

async function main() {
  try {
    const testsDir = "./__tests__";
    const testFileMatcher = /.*\.test\.(ts|js|tsx|jsx)$/;
    const parallel = 4;

    const testFiles: string[] = [];

    await _walkFiles(testsDir, (root, name) => {
      if (testFileMatcher.test(name)) {
        testFiles.push(_join(root, name));
      }
    });

    const testRunners = Array.from(
      { length: parallel },
      () => new TestRunner(testFiles)
    );

    await Promise.all(testRunners.map((runner) => runner.start()));

    if (testRunners.some((runner) => !runner.success)) {
      console.warn("\nTests have failed.\n");
    } else {
      console.log("\nAll tests have passed.\n");
    }
  } catch (e) {
    console.error(e);
  } finally {
    Gtk.main_quit();
  }
}

Gtk.init(null);
main();
Gtk.main();
