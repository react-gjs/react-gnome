import GLib from "gi://GLib?version=2.0";
import { SourceMap, SourceMapReader } from "./helpers/sourcemap-reader";

const EOL = "\n";

const COLOR = {
  // info labels colors
  Red: "\u001b[38;5;160m",
  Blue: "\u001b[38;5;39m",
  Purple: "\u001b[38;5;93m",
  Yellow: "\u001b[38;5;220m",
  Grey: "\u001b[38;5;247m",
  HotOrange: "\u001b[38;5;202m",

  // object formatting
  BracketBlue: "\u001b[38;5;75m",
  BracketGreen: "\u001b[38;5;77m",
  BracketYellow: "\u001b[38;5;178m",
  BracketMagenta: "\u001b[38;5;165m",
  BracketGrey: "\u001b[38;5;251m",
  Key: "\u001b[38;5;252m",

  Reset: "\u001b[0m",
};

function red(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Red}${text}${COLOR.Reset}`;
}

function blue(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Blue}${text}${COLOR.Reset}`;
}

function purple(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Purple}${text}${COLOR.Reset}`;
}

function yellow(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Yellow}${text}${COLOR.Reset}`;
}

function grey(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Grey}${text}${COLOR.Reset}`;
}

function hotOrange(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.HotOrange}${text}${COLOR.Reset}`;
}

function bracketBlue(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketBlue}${text}${COLOR.Reset}`;
}

function bracketGreen(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketGreen}${text}${COLOR.Reset}`;
}

function bracketYellow(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketYellow}${text}${COLOR.Reset}`;
}

function bracketMagenta(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketMagenta}${text}${COLOR.Reset}`;
}

function bracketGrey(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketGrey}${text}${COLOR.Reset}`;
}

function keyClr(text: string) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Key}${text}${COLOR.Reset}`;
}

const BRACKET_COLORS = [
  bracketBlue,
  bracketYellow,
  bracketMagenta,
  bracketGreen,
  bracketGrey,
];

function bracket(bracketChar: string, depth: number) {
  depth -= 1;
  const colorfn = BRACKET_COLORS[depth % BRACKET_COLORS.length]!;
  return colorfn(bracketChar);
}

/**
 * A simple regex to capture formatting specifiers
 */
const specifierTest = /%(d|i|s|f|o|O|c)/;

function makeIndent(indent: number, indentSize = 2) {
  if (indent < 0) {
    indent = 0;
  }
  return Array.from({ length: indent * indentSize }, () => " ").join("");
}

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

function isTypedArray(value: unknown): value is TypedArray {
  return ArrayBuffer.isView(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

type FmtContext = {
  depth: number;
  parentRefs: Map<object, string>;
  currentLocation: string;
};

function fmtError(err: Error | GLib.Error): string {
  const trace = StacktraceResolver.mapStackTrace(err.stack?.trim() ?? "");
  return `${err.name}: ${err.message}${EOL}${
    err.stack ? addIndent(trace, 2) : "No stack trace available"
  }`;
}

function fmtKey(key: unknown): string {
  switch (typeof key) {
    case "bigint":
    case "string":
    case "number":
    case "boolean":
      return String(key);
    case "function":
      return `[Function ${key.name}]`;
    case "symbol":
      return `[Symbol ${key.toString()}]`;
    case "undefined":
      return "undefined";
    case "object": {
      if (key === null) return "null";
      return "Object";
    }
  }
}

function fmtMap(map: Map<unknown, unknown>, ctx: FmtContext): string {
  const indent = makeIndent(ctx.depth);

  ctx.parentRefs.set(map, ctx.currentLocation);

  let fmtd = `Map${bracket("<", ctx.depth)}${EOL}`;
  for (let [key, value] of map) {
    key = fmtKey(key);
    const nextCtx: FmtContext = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}.${key}`,
    };
    const fmtv = fmt(value, nextCtx);
    fmtd += `${indent}${keyClr(String(key))}: ${fmtv},${EOL}`;
  }
  fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;

  ctx.parentRefs.delete(map);

  return fmtd;
}

function fmtSet(set: Set<unknown>, ctx: FmtContext): string {
  const indent = makeIndent(ctx.depth);

  ctx.parentRefs.set(set, ctx.currentLocation);

  let fmtd = `Set${bracket("<", ctx.depth)}${EOL}`;
  for (const value of set) {
    const nextCtx: FmtContext = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}.<SetEntry>`,
    };
    const fmtv = fmt(value, nextCtx);
    fmtd += `${indent}${fmtv},${EOL}`;
  }
  fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;

  ctx.parentRefs.delete(set);

  return fmtd;
}

function fmtArray(arr: Array<unknown> | TypedArray, ctx: FmtContext): string {
  const indent = makeIndent(ctx.depth);

  ctx.parentRefs.set(arr, ctx.currentLocation);

  const entries: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    const nextCtx: FmtContext = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}[${i}]`,
    };
    const fmtv = fmt(value, nextCtx);
    entries.push(fmtv);
  }
  let fmtd = bracket("[", ctx.depth);
  const totalEntriesLen = entries.reduce((sum, e) => sum + e.length, 0);
  if (totalEntriesLen < 28) {
    fmtd += `${entries.join(", ")}${bracket("]", ctx.depth)}`;
  } else {
    fmtd += `${EOL}${entries
      .map((e) => `${indent}${e}`)
      .join(
        `,${EOL}`,
      )},${EOL}${makeIndent(ctx.depth - 1)}${bracket("]", ctx.depth)}`;
  }

  ctx.parentRefs.delete(arr);

  return fmtd;
}

function fmtTypedArray(arr: TypedArray, ctx: FmtContext): string {
  const typedArrayName = arr.constructor.name;
  return `${typedArrayName} ${fmtArray(arr, ctx)}`;
}

function fmtPlainObject(obj: Record<any, unknown>, ctx: FmtContext): string {
  const indent = makeIndent(ctx.depth);

  ctx.parentRefs.set(obj, ctx.currentLocation);

  let fmtd = "";
  if ("constructor" in obj && obj.constructor.name !== "Object") {
    fmtd += `${obj.constructor.name} `;
    // @ts-expect-error
  } else if (obj[Symbol.toStringTag] === "GIRepositoryNamespace") {
    // @ts-expect-error
    fmtd += `[${obj[Symbol.toStringTag]} ${obj.__name__}] `;
  }

  fmtd += `${bracket("{", ctx.depth)}${EOL}`;
  const keys = Object.keys(obj);
  if (keys.length > 0) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!;
      const value = obj[key];
      const nextCtx: FmtContext = {
        parentRefs: ctx.parentRefs,
        depth: ctx.depth + 1,
        currentLocation: `${ctx.currentLocation}.${key}`,
      };
      const fmtv = fmt(value, nextCtx);
      fmtd += `${indent}${keyClr(String(key))}: ${fmtv},${EOL}`;
    }
    fmtd += `${makeIndent(ctx.depth - 1)}${bracket("}", ctx.depth)}`;
  } else {
    fmtd = fmtd.substring(0, fmtd.length - 1);
    fmtd += bracket("}", ctx.depth);
  }

  ctx.parentRefs.delete(obj);

  return fmtd;
}

function fmtObject(obj: object, ctx: FmtContext): string {
  if (ctx.parentRefs.has(obj)) {
    const ref = ctx.parentRefs.get(obj);
    return `## Recursive reference [${ref}] ##`;
  }

  if ("toConsolePrint" in obj && typeof obj.toConsolePrint === "function") {
    const objStr = obj.toConsolePrint();
    if (typeof objStr === "string") {
      return addIndent(objStr, ctx.depth, 1);
    }
  }

  if (obj instanceof Error) {
    return fmtError(obj);
  }
  if (obj instanceof GLib.Error) {
    return fmtError(obj);
  }
  if (obj instanceof Map) {
    return fmtMap(obj, ctx);
  }
  if (obj instanceof Set) {
    return fmtSet(obj, ctx);
  }
  if (isTypedArray(obj)) {
    return fmtTypedArray(obj, ctx);
  }
  if (isArray(obj)) {
    return fmtArray(obj, ctx);
  }
  return fmtPlainObject(obj as any, ctx);
}

function fmt(
  item: unknown,
  ctx: FmtContext = { depth: 1, parentRefs: new Map(), currentLocation: "" },
): string {
  switch (typeof item) {
    case "bigint":
    case "string":
    case "number":
    case "boolean":
      return String(item);
    case "function":
      return `[Function ${item.name}]`;
    case "symbol":
      return `[Symbol ${item.toString()}]`;
    case "undefined":
      return "undefined";
    case "object": {
      if (item === null) return "null";
      return fmtObject(item, ctx);
    }
  }
}

function fmtArgs(args: unknown[]) {
  args = args.slice();
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (value instanceof Error) {
      args[i] = fmtError(value);
    } else if (typeof value === "object" && value !== null) {
      args[i] = fmt(value);
    }
  }
  return args;
}

/**
 * @param {string} str a string to check for format specifiers like %s or %i
 * @returns {boolean}
 */
function hasFormatSpecifiers(str: string) {
  return specifierTest.test(str);
}

/**
 * @param {any} item an item to format
 * @returns {string}
 */
function formatOptimally(item: unknown) {
  // Handle optimal error formatting.
  if (item instanceof Error || item instanceof GLib.Error) {
    return `${item.toString()}${item.stack ? EOL : ""}${item.stack
      ?.split(EOL)
      // Pad each stacktrace line.
      .map((line) => line.padStart(2, " "))
      .join(EOL)}`;
  }

  if (typeof item === "object" && item !== null) {
    if (item.constructor?.name !== "Object") {
      return `${item.constructor?.name} ${fmt(item)}`;
    } else if (String(item) === "GIRepositoryNamespace") {
      // @ts-expect-error
      return `[${String(item)} ${item.__name__}]`;
    }
  }
  return fmt(item);
}

function addIndent(text: string, indent: number, startFromLine = 0) {
  const identStr = makeIndent(indent, 1);
  const lines = text.split(EOL);
  for (let i = startFromLine; i < lines.length; i++) {
    lines[i] = identStr + lines[i];
  }
  return lines.join(EOL);
}

const NUM_REGEX = /^-?\d+(\.\d+)?$/;
function isNumber(value: unknown) {
  return (
    typeof value === "number" ||
    typeof value === "bigint" ||
    (typeof value === "string" && NUM_REGEX.test(value))
  );
}

enum LogLevel {
  Log = "log",
  Dir = "dir",
  Dirxml = "dirxml",
  Trace = "trace",
  Group = "group",
  GroupCollapsed = "groupCollapsed",
  TimeLog = "timeLog",
  TimeEnd = "timeEnd",
  Debug = "debug",
  Count = "count",
  CountReset = "countReset",
  Info = "info",
  Warn = "warn",
  ReportWarning = "reportWarning",
  Error = "error",
  Assert = "assert",
}

function addLogPrefix(loglevel: LogLevel, message: string) {
  switch (loglevel) {
    case LogLevel.Log:
      return `[${grey("LOG")}] ${message}`;
    case LogLevel.Warn:
      return `[${yellow("WARN")}] ${message}`;
    case LogLevel.Error:
      return `[${red("ERROR")}] ${message}`;
    case LogLevel.Assert:
      return `[${hotOrange("ASSERT")}] ${message}`;
    case LogLevel.Debug:
      return `[${purple("DEBUG")}] ${message}`;
    case LogLevel.Info:
      return `[${blue("INFO")}] ${message}`;
    case LogLevel.Trace:
      return `[${grey("TRACE")}] ${message}`;
    case LogLevel.Group:
    case LogLevel.GroupCollapsed:
      return `[${grey("GROUP")}] ${message}`;
    case LogLevel.Count:
    case LogLevel.CountReset:
      return `[${grey("COUNT")}] ${message}`;
    case LogLevel.TimeLog:
    case LogLevel.TimeEnd:
      return `[${grey("TIME")}] ${message}`;
    default:
      return message;
  }
}

type PrinterOptions = {
  stackTrace?: string;
  fields?: Record<any, any>;
};

class ConsoleUtils {
  private static indent = 0;
  private static counters = new Map<unknown, number>();
  private static timers = new Map<unknown, number>();
  static pretty = true;

  static incrementCounter(label: string) {
    const count = this.counters.get(label) ?? 0;
    const newCount = count + 1;
    this.counters.set(label, newCount);
    return newCount;
  }

  static resetCounter(label: string) {
    this.counters.delete(label);
  }

  static clearIndent() {
    this.indent = 0;
  }

  static enterGroup() {
    this.indent++;
  }

  static leaveGroup() {
    this.indent = Math.max(0, this.indent - 1);
  }

  static startTimer(label: unknown, time: number) {
    this.timers.set(label, time);
  }

  static getTimer(label: unknown) {
    return this.timers.get(label);
  }

  static endTimer(label?: unknown) {
    const startTime = this.timers.get(label);
    this.timers.delete(label);
    return startTime;
  }

  static logger(logLevel: LogLevel, args: unknown[]) {
    if (args.length === 0) {
      this.printer(logLevel, []);
      return;
    }

    if (args.length === 1) {
      this.printer(logLevel, fmtArgs(args));
      return undefined;
    }

    const [first, ...rest] = args;

    // If first does not contain any format specifiers, don't call Formatter
    if (typeof first !== "string" || !hasFormatSpecifiers(first)) {
      this.printer(logLevel, fmtArgs(args));
      return undefined;
    }

    // Otherwise, perform print the result of Formatter.
    this.printer(logLevel, this.formatter([first, ...rest]));

    return undefined;
  }

  static formatter(args: unknown[]): unknown[] {
    if (args.length === 1) return args;

    // The initial formatting string is the first arg
    let target = String(args[0]);

    const current = args[1];

    // Find the index of the first format specifier.
    const specifierIndex = specifierTest.exec(target)?.index!;
    const specifier = target.slice(specifierIndex, specifierIndex + 2);
    let converted = null;
    switch (specifier) {
      case "%s":
        converted = String(current);
        break;
      case "%d":
      case "%i":
        if (!isNumber(current)) {
          converted = 0;
        } else {
          converted = Number(current).toFixed(0);
        }
        break;
      case "%f":
        if (!isNumber(current)) {
          converted = 0;
        } else {
          converted = String(Number(current));
        }
        break;
      case "%o":
        converted = formatOptimally(current);
        break;
      case "%O":
        converted = fmt(current);
        break;
      case "%c":
        converted = "";
        break;
    }
    // If any of the previous steps set converted, replace the specifier in
    // target with the converted value.
    if (converted !== null) {
      target =
        target.slice(0, specifierIndex) +
        converted +
        target.slice(specifierIndex + 2);
    }

    if (!hasFormatSpecifiers(target)) {
      return [target, ...fmtArgs(args.slice(2))];
    }

    const result = [target, ...args.slice(2)];

    if (result.length === 1) return result;

    return this.formatter(result);
  }

  static printer(
    logLevel: LogLevel,
    args: unknown[],
    options: PrinterOptions = {},
  ) {
    let severity;

    switch (logLevel) {
      case LogLevel.Log:
      case LogLevel.Dir:
      case LogLevel.Dirxml:
      case LogLevel.Trace:
      case LogLevel.Group:
      case LogLevel.GroupCollapsed:
      case LogLevel.TimeLog:
      case LogLevel.TimeEnd:
        severity = GLib.LogLevelFlags.LEVEL_MESSAGE;
        break;
      case LogLevel.Debug:
        severity = GLib.LogLevelFlags.LEVEL_DEBUG;
        break;
      case LogLevel.Count:
      case LogLevel.Info:
        severity = GLib.LogLevelFlags.LEVEL_INFO;
        break;
      case LogLevel.Warn:
      case LogLevel.CountReset:
      case LogLevel.ReportWarning:
        severity = GLib.LogLevelFlags.LEVEL_WARNING;
        break;
      case LogLevel.Error:
      case LogLevel.Assert:
        severity = GLib.LogLevelFlags.LEVEL_CRITICAL;
        break;
      default:
        severity = GLib.LogLevelFlags.LEVEL_MESSAGE;
    }

    const output = args
      .map((a) => {
        if (a === null) return "null";
        else if (typeof a === "object") return formatOptimally(a);
        else if (typeof a === "undefined") return "undefined";
        else if (typeof a === "bigint") return `${a}n`;
        else return String(a);
      })
      .join(" ");

    let formattedOutput = output; // addIndent(, this.indent);
    const extraFields: {
      CODE_FUNC?: string;
      CODE_FILE?: string;
      CODE_LINE?: string;
    } = {};

    let stackTrace = options?.stackTrace;
    let stackTraceLines: string[] | null = null;
    if (
      !stackTrace &&
      (logLevel === "trace" || severity <= GLib.LogLevelFlags.LEVEL_WARNING)
    ) {
      stackTrace = new Error().stack;
      if (stackTrace) {
        const currentFile = stackTrace.match(/^[^@]*@(.*):\d+:\d+$/m)?.at(1);
        if (currentFile) {
          const index =
            stackTrace.lastIndexOf(currentFile) + currentFile.length;

          stackTraceLines = stackTrace.substring(index).split(EOL);
          // Remove the remainder of the first line
          stackTraceLines.shift();
        }
      }
    }

    if (stackTraceLines == null) {
      stackTraceLines = [];
    }

    if (logLevel === LogLevel.Trace) {
      if (stackTraceLines.length) {
        formattedOutput += `${EOL}${addIndent(
          stackTraceLines.join(EOL),
          this.indent,
        )}`;
      } else {
        formattedOutput += `${EOL}${addIndent(
          "No stack trace available",
          this.indent,
        )}`;
      }
    }

    if (stackTraceLines.length) {
      const [stackLine] = stackTraceLines;
      const match = stackLine?.match(/^([^@]*)@(.*):(\d+):\d+$/);

      if (match) {
        const [_, func, file, line] = match;

        if (func) extraFields.CODE_FUNC = func;
        if (file) extraFields.CODE_FILE = file;
        if (line) extraFields.CODE_LINE = line;
      }
    }

    const logContent = addLogPrefix(logLevel, formattedOutput);
    print(logContent);
  }
}

/**
 * Implementation of the WHATWG Console object.
 */
const Console = {
  get [Symbol.toStringTag]() {
    return "console";
  },

  assert(condition: unknown, ...data: unknown[]) {
    if (condition) return;

    const message = "Assertion failed";

    if (data.length === 0) data.push(message);

    if (typeof data[0] !== "string") {
      data.unshift(message);
    } else {
      const first = data.shift();
      data.unshift(`${message}: ${first}`);
    }
    ConsoleUtils.logger(LogLevel.Assert, data);
  },

  clear() {
    ConsoleUtils.clearIndent();
    imports.gi.GjsPrivate.clear_terminal();
  },

  debug(...data: unknown[]) {
    ConsoleUtils.logger(LogLevel.Debug, data);
  },

  error(...data: unknown[]) {
    ConsoleUtils.logger(LogLevel.Error, data);
  },

  info(...data: unknown[]) {
    ConsoleUtils.logger(LogLevel.Info, data);
  },

  log(...data: unknown[]) {
    ConsoleUtils.logger(LogLevel.Log, data);
  },

  table(tabularData: unknown, _properties: unknown) {
    this.log(tabularData);
  },

  trace(...data: unknown[]) {
    if (data.length === 0) data = ["Trace"];

    ConsoleUtils.logger(LogLevel.Trace, data);
  },

  warn(...data: unknown[]) {
    ConsoleUtils.logger(LogLevel.Warn, data);
  },

  dir(item: unknown, options: never) {
    const object = fmt(item);
    ConsoleUtils.printer(LogLevel.Dir, [object], options);
  },

  dirxml(...data: unknown[]) {
    this.log(...data);
  },

  count(label: string) {
    const count = ConsoleUtils.incrementCounter(label);
    const msg = `${label}: ${count}`;
    ConsoleUtils.logger(LogLevel.Count, [msg]);
  },

  countReset(label: string) {
    ConsoleUtils.resetCounter(label);
  },

  group(...data: unknown[]) {
    ConsoleUtils.enterGroup();
    ConsoleUtils.logger(LogLevel.Group, data);
  },

  groupCollapsed(...data: unknown[]) {
    this.group(...data);
  },

  groupEnd() {
    ConsoleUtils.leaveGroup();
  },

  time(label: unknown) {
    const ts = imports.gi.GLib.get_monotonic_time();
    ConsoleUtils.startTimer(label, ts);
  },

  timeLog(label: unknown, ...data: unknown[]) {
    const startTime = ConsoleUtils.getTimer(label);
    if (startTime == null) {
      ConsoleUtils.logger(LogLevel.Warn, [`Timer “${label}” doesn’t exist.`]);
      return;
    }
    const ts = imports.gi.GLib.get_monotonic_time();
    const durationMs = (ts - startTime) / 1000;
    const msg = `${label}: ${durationMs.toFixed(3)} ms`;
    data.unshift(msg);

    ConsoleUtils.printer(LogLevel.TimeLog, data);
  },

  timeEnd(label: unknown) {
    const startTime = ConsoleUtils.endTimer(label);
    if (startTime == null) {
      ConsoleUtils.logger(LogLevel.Warn, [`Timer “${label}” doesn’t exist.`]);
      return;
    }
    const ts = imports.gi.GLib.get_monotonic_time();
    const durationMs = (ts - startTime) / 1000;
    const msg = `${label}: ${durationMs.toFixed(3)} ms`;
    ConsoleUtils.printer(LogLevel.TimeEnd, [msg]);
  },

  profile() {},

  profileEnd() {},

  timeStamp() {},

  setPretty(pretty: boolean) {
    ConsoleUtils.pretty = !!pretty;
  },

  mapStackTrace(stackTrace: string) {
    return StacktraceResolver.mapStackTrace(stackTrace);
  },
};

type AppSourceMaps = SourceMap & {
  rowOffset: number;
  colOffset: number;
  root: string;
  wd: string;
};

class StacktraceResolver {
  static sourcmapReader?: SourceMapReader;
  static map: AppSourceMaps;

  static {
    import(`${imports.package.moduledir}/main.js.map`)
      .then((main: { map: string }) => {
        const map = JSON.parse(main.map) as AppSourceMaps;
        StacktraceResolver.map = map;
        StacktraceResolver.sourcmapReader = new SourceMapReader(map, map.root);
      })
      .catch((error) => {});
  }

  static mapStackTrace(stack: string) {
    if (!StacktraceResolver.sourcmapReader) {
      return stack;
    }

    const lines = stack.split(EOL);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const match = line.match(/main.js:\d+:\d+$/);
      if (match) {
        const lineCol = line.split("/main.js:").pop()!;
        const [lineNo, colNo] = lineCol.split(":") as [string, string];
        const l = Number(lineNo) - this.map.rowOffset;
        const c = Number(colNo) - this.map.colOffset;
        const org = StacktraceResolver.sourcmapReader.getOriginalPosition(l, c);
        if (org && org.file) {
          if (org.file.startsWith(StacktraceResolver.map.wd)) {
            org.file =
              "./" + org.file.substring(StacktraceResolver.map.wd.length + 1);
          }

          if (org.symbolName == null) {
            if (line.match(/^[\w\d]+@/)) {
              org.symbolName = line.split("@")[0];
            }
          }

          if (org.symbolName) {
            lines[i] =
              `${org.symbolName} at ${org.file}:${org.line}:${org.column}`;
          } else {
            lines[i] = `at ${org.file}:${org.line}:${org.column}`;
          }
        }
      }
    }
    return lines.join(EOL);
  }
}

export { Console as __console_proxy };
