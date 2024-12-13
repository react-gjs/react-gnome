// src/runtime/console.ts
import GLib from "gi://GLib?version=2.0";
import { SourceMapReader } from "./helpers/sourcemap-reader.mjs";
var EOL = "\n";
var COLOR = {
  // info labels colors
  Red: "\x1B[38;5;160m",
  Blue: "\x1B[38;5;39m",
  Purple: "\x1B[38;5;93m",
  Yellow: "\x1B[38;5;220m",
  Grey: "\x1B[38;5;247m",
  HotOrange: "\x1B[38;5;202m",
  // object formatting
  BracketBlue: "\x1B[38;5;75m",
  BracketGreen: "\x1B[38;5;77m",
  BracketYellow: "\x1B[38;5;178m",
  BracketMagenta: "\x1B[38;5;165m",
  BracketGrey: "\x1B[38;5;251m",
  Key: "\x1B[38;5;252m",
  Reset: "\x1B[0m"
};
function red(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Red}${text}${COLOR.Reset}`;
}
function blue(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Blue}${text}${COLOR.Reset}`;
}
function purple(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Purple}${text}${COLOR.Reset}`;
}
function yellow(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Yellow}${text}${COLOR.Reset}`;
}
function grey(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Grey}${text}${COLOR.Reset}`;
}
function hotOrange(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.HotOrange}${text}${COLOR.Reset}`;
}
function bracketBlue(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketBlue}${text}${COLOR.Reset}`;
}
function bracketGreen(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketGreen}${text}${COLOR.Reset}`;
}
function bracketYellow(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketYellow}${text}${COLOR.Reset}`;
}
function bracketMagenta(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketMagenta}${text}${COLOR.Reset}`;
}
function bracketGrey(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.BracketGrey}${text}${COLOR.Reset}`;
}
function keyClr(text) {
  if (!ConsoleUtils.pretty) return text;
  return `${COLOR.Key}${text}${COLOR.Reset}`;
}
var BRACKET_COLORS = [
  bracketBlue,
  bracketYellow,
  bracketMagenta,
  bracketGreen,
  bracketGrey
];
function bracket(bracketChar, depth) {
  depth -= 1;
  const colorfn = BRACKET_COLORS[depth % BRACKET_COLORS.length];
  return colorfn(bracketChar);
}
var specifierTest = /%(d|i|s|f|o|O|c)/;
function makeIndent(indent, indentSize = 2) {
  if (indent < 0) {
    indent = 0;
  }
  return Array.from({ length: indent * indentSize }, () => " ").join("");
}
function isTypedArray(value) {
  return ArrayBuffer.isView(value);
}
function isArray(value) {
  return Array.isArray(value);
}
function fmtError(err) {
  const trace = StacktraceResolver.mapStackTrace(err.stack?.trim() ?? "");
  return `${err.name}: ${err.message}${EOL}${err.stack ? addIndent(trace, 2) : "No stack trace available"}`;
}
function fmtKey(key) {
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
function fmtMap(map, ctx) {
  const indent = makeIndent(ctx.depth);
  ctx.parentRefs.set(map, ctx.currentLocation);
  let fmtd = `Map${bracket("<", ctx.depth)}${EOL}`;
  for (let [key, value] of map) {
    key = fmtKey(key);
    const nextCtx = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}.${key}`
    };
    const fmtv = fmt(value, nextCtx);
    fmtd += `${indent}${keyClr(String(key))}: ${fmtv},${EOL}`;
  }
  fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;
  ctx.parentRefs.delete(map);
  return fmtd;
}
function fmtSet(set, ctx) {
  const indent = makeIndent(ctx.depth);
  ctx.parentRefs.set(set, ctx.currentLocation);
  let fmtd = `Set${bracket("<", ctx.depth)}${EOL}`;
  for (const value of set) {
    const nextCtx = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}.<SetEntry>`
    };
    const fmtv = fmt(value, nextCtx);
    fmtd += `${indent}${fmtv},${EOL}`;
  }
  fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;
  ctx.parentRefs.delete(set);
  return fmtd;
}
function fmtArray(arr, ctx) {
  const indent = makeIndent(ctx.depth);
  ctx.parentRefs.set(arr, ctx.currentLocation);
  const entries = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    const nextCtx = {
      parentRefs: ctx.parentRefs,
      depth: ctx.depth + 1,
      currentLocation: `${ctx.currentLocation}[${i}]`
    };
    const fmtv = fmt(value, nextCtx);
    entries.push(fmtv);
  }
  let fmtd = bracket("[", ctx.depth);
  const totalEntriesLen = entries.reduce((sum, e) => sum + e.length, 0);
  if (totalEntriesLen < 28) {
    fmtd += `${entries.join(", ")}${bracket("]", ctx.depth)}`;
  } else {
    fmtd += `${EOL}${entries.map((e) => `${indent}${e}`).join(
      `,${EOL}`
    )},${EOL}${makeIndent(ctx.depth - 1)}${bracket("]", ctx.depth)}`;
  }
  ctx.parentRefs.delete(arr);
  return fmtd;
}
function fmtTypedArray(arr, ctx) {
  const typedArrayName = arr.constructor.name;
  return `${typedArrayName} ${fmtArray(arr, ctx)}`;
}
function fmtPlainObject(obj, ctx) {
  const indent = makeIndent(ctx.depth);
  ctx.parentRefs.set(obj, ctx.currentLocation);
  let fmtd = "";
  if ("constructor" in obj && obj.constructor.name !== "Object") {
    fmtd += `${obj.constructor.name} `;
  } else if (obj[Symbol.toStringTag] === "GIRepositoryNamespace") {
    fmtd += `[${obj[Symbol.toStringTag]} ${obj.__name__}] `;
  }
  fmtd += `${bracket("{", ctx.depth)}${EOL}`;
  const keys = Object.keys(obj);
  if (keys.length > 0) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = obj[key];
      const nextCtx = {
        parentRefs: ctx.parentRefs,
        depth: ctx.depth + 1,
        currentLocation: `${ctx.currentLocation}.${key}`
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
function fmtObject(obj, ctx) {
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
  return fmtPlainObject(obj, ctx);
}
function fmt(item, ctx = { depth: 1, parentRefs: /* @__PURE__ */ new Map(), currentLocation: "" }) {
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
function fmtArgs(args) {
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
function hasFormatSpecifiers(str) {
  return specifierTest.test(str);
}
function formatOptimally(item) {
  if (item instanceof Error || item instanceof GLib.Error) {
    return `${item.toString()}${item.stack ? EOL : ""}${item.stack?.split(EOL).map((line) => line.padStart(2, " ")).join(EOL)}`;
  }
  if (typeof item === "object" && item !== null) {
    if (item.constructor?.name !== "Object") {
      return `${item.constructor?.name} ${fmt(item)}`;
    } else if (String(item) === "GIRepositoryNamespace") {
      return `[${String(item)} ${item.__name__}]`;
    }
  }
  return fmt(item);
}
function addIndent(text, indent, startFromLine = 0) {
  const identStr = makeIndent(indent, 1);
  const lines = text.split(EOL);
  for (let i = startFromLine; i < lines.length; i++) {
    lines[i] = identStr + lines[i];
  }
  return lines.join(EOL);
}
var NUM_REGEX = /^-?\d+(\.\d+)?$/;
function isNumber(value) {
  return typeof value === "number" || typeof value === "bigint" || typeof value === "string" && NUM_REGEX.test(value);
}
function addLogPrefix(loglevel, message) {
  switch (loglevel) {
    case "log" /* Log */:
      return `[${grey("LOG")}] ${message}`;
    case "warn" /* Warn */:
      return `[${yellow("WARN")}] ${message}`;
    case "error" /* Error */:
      return `[${red("ERROR")}] ${message}`;
    case "assert" /* Assert */:
      return `[${hotOrange("ASSERT")}] ${message}`;
    case "debug" /* Debug */:
      return `[${purple("DEBUG")}] ${message}`;
    case "info" /* Info */:
      return `[${blue("INFO")}] ${message}`;
    case "trace" /* Trace */:
      return `[${grey("TRACE")}] ${message}`;
    case "group" /* Group */:
    case "groupCollapsed" /* GroupCollapsed */:
      return `[${grey("GROUP")}] ${message}`;
    case "count" /* Count */:
    case "countReset" /* CountReset */:
      return `[${grey("COUNT")}] ${message}`;
    case "timeLog" /* TimeLog */:
    case "timeEnd" /* TimeEnd */:
      return `[${grey("TIME")}] ${message}`;
    default:
      return message;
  }
}
var ConsoleUtils = class {
  static indent = 0;
  static counters = /* @__PURE__ */ new Map();
  static timers = /* @__PURE__ */ new Map();
  static pretty = true;
  static incrementCounter(label) {
    const count = this.counters.get(label) ?? 0;
    const newCount = count + 1;
    this.counters.set(label, newCount);
    return newCount;
  }
  static resetCounter(label) {
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
  static startTimer(label, time) {
    this.timers.set(label, time);
  }
  static getTimer(label) {
    return this.timers.get(label);
  }
  static endTimer(label) {
    const startTime = this.timers.get(label);
    this.timers.delete(label);
    return startTime;
  }
  static logger(logLevel, args) {
    if (args.length === 0) {
      this.printer(logLevel, []);
      return;
    }
    if (args.length === 1) {
      this.printer(logLevel, fmtArgs(args));
      return void 0;
    }
    const [first, ...rest] = args;
    if (typeof first !== "string" || !hasFormatSpecifiers(first)) {
      this.printer(logLevel, fmtArgs(args));
      return void 0;
    }
    this.printer(logLevel, this.formatter([first, ...rest]));
    return void 0;
  }
  static formatter(args) {
    if (args.length === 1) return args;
    let target = String(args[0]);
    const current = args[1];
    const specifierIndex = specifierTest.exec(target)?.index;
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
    if (converted !== null) {
      target = target.slice(0, specifierIndex) + converted + target.slice(specifierIndex + 2);
    }
    if (!hasFormatSpecifiers(target)) {
      return [target, ...fmtArgs(args.slice(2))];
    }
    const result = [target, ...args.slice(2)];
    if (result.length === 1) return result;
    return this.formatter(result);
  }
  static printer(logLevel, args, options = {}) {
    let severity;
    switch (logLevel) {
      case "log" /* Log */:
      case "dir" /* Dir */:
      case "dirxml" /* Dirxml */:
      case "trace" /* Trace */:
      case "group" /* Group */:
      case "groupCollapsed" /* GroupCollapsed */:
      case "timeLog" /* TimeLog */:
      case "timeEnd" /* TimeEnd */:
        severity = GLib.LogLevelFlags.LEVEL_MESSAGE;
        break;
      case "debug" /* Debug */:
        severity = GLib.LogLevelFlags.LEVEL_DEBUG;
        break;
      case "count" /* Count */:
      case "info" /* Info */:
        severity = GLib.LogLevelFlags.LEVEL_INFO;
        break;
      case "warn" /* Warn */:
      case "countReset" /* CountReset */:
      case "reportWarning" /* ReportWarning */:
        severity = GLib.LogLevelFlags.LEVEL_WARNING;
        break;
      case "error" /* Error */:
      case "assert" /* Assert */:
        severity = GLib.LogLevelFlags.LEVEL_CRITICAL;
        break;
      default:
        severity = GLib.LogLevelFlags.LEVEL_MESSAGE;
    }
    const output = args.map((a) => {
      if (a === null) return "null";
      else if (typeof a === "object") return formatOptimally(a);
      else if (typeof a === "undefined") return "undefined";
      else if (typeof a === "bigint") return `${a}n`;
      else return String(a);
    }).join(" ");
    let formattedOutput = output;
    const extraFields = {};
    let stackTrace = options?.stackTrace;
    let stackTraceLines = null;
    if (!stackTrace && (logLevel === "trace" || severity <= GLib.LogLevelFlags.LEVEL_WARNING)) {
      stackTrace = new Error().stack;
      if (stackTrace) {
        const currentFile = stackTrace.match(/^[^@]*@(.*):\d+:\d+$/m)?.at(1);
        if (currentFile) {
          const index = stackTrace.lastIndexOf(currentFile) + currentFile.length;
          stackTraceLines = stackTrace.substring(index).split(EOL);
          stackTraceLines.shift();
        }
      }
    }
    if (stackTraceLines == null) {
      stackTraceLines = [];
    }
    if (logLevel === "trace" /* Trace */) {
      if (stackTraceLines.length) {
        formattedOutput += `${EOL}${addIndent(
          stackTraceLines.join(EOL),
          this.indent
        )}`;
      } else {
        formattedOutput += `${EOL}${addIndent(
          "No stack trace available",
          this.indent
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
};
var Console = {
  get [Symbol.toStringTag]() {
    return "console";
  },
  assert(condition, ...data) {
    if (condition) return;
    const message = "Assertion failed";
    if (data.length === 0) data.push(message);
    if (typeof data[0] !== "string") {
      data.unshift(message);
    } else {
      const first = data.shift();
      data.unshift(`${message}: ${first}`);
    }
    ConsoleUtils.logger("assert" /* Assert */, data);
  },
  clear() {
    ConsoleUtils.clearIndent();
    imports.gi.GjsPrivate.clear_terminal();
  },
  debug(...data) {
    ConsoleUtils.logger("debug" /* Debug */, data);
  },
  error(...data) {
    ConsoleUtils.logger("error" /* Error */, data);
  },
  info(...data) {
    ConsoleUtils.logger("info" /* Info */, data);
  },
  log(...data) {
    ConsoleUtils.logger("log" /* Log */, data);
  },
  table(tabularData, _properties) {
    this.log(tabularData);
  },
  trace(...data) {
    if (data.length === 0) data = ["Trace"];
    ConsoleUtils.logger("trace" /* Trace */, data);
  },
  warn(...data) {
    ConsoleUtils.logger("warn" /* Warn */, data);
  },
  dir(item, options) {
    const object = fmt(item);
    ConsoleUtils.printer("dir" /* Dir */, [object], options);
  },
  dirxml(...data) {
    this.log(...data);
  },
  count(label) {
    const count = ConsoleUtils.incrementCounter(label);
    const msg = `${label}: ${count}`;
    ConsoleUtils.logger("count" /* Count */, [msg]);
  },
  countReset(label) {
    ConsoleUtils.resetCounter(label);
  },
  group(...data) {
    ConsoleUtils.enterGroup();
    ConsoleUtils.logger("group" /* Group */, data);
  },
  groupCollapsed(...data) {
    this.group(...data);
  },
  groupEnd() {
    ConsoleUtils.leaveGroup();
  },
  time(label) {
    const ts = imports.gi.GLib.get_monotonic_time();
    ConsoleUtils.startTimer(label, ts);
  },
  timeLog(label, ...data) {
    const startTime = ConsoleUtils.getTimer(label);
    if (startTime == null) {
      ConsoleUtils.logger("warn" /* Warn */, [`Timer \u201C${label}\u201D doesn\u2019t exist.`]);
      return;
    }
    const ts = imports.gi.GLib.get_monotonic_time();
    const durationMs = (ts - startTime) / 1e3;
    const msg = `${label}: ${durationMs.toFixed(3)} ms`;
    data.unshift(msg);
    ConsoleUtils.printer("timeLog" /* TimeLog */, data);
  },
  timeEnd(label) {
    const startTime = ConsoleUtils.endTimer(label);
    if (startTime == null) {
      ConsoleUtils.logger("warn" /* Warn */, [`Timer \u201C${label}\u201D doesn\u2019t exist.`]);
      return;
    }
    const ts = imports.gi.GLib.get_monotonic_time();
    const durationMs = (ts - startTime) / 1e3;
    const msg = `${label}: ${durationMs.toFixed(3)} ms`;
    ConsoleUtils.printer("timeEnd" /* TimeEnd */, [msg]);
  },
  profile() {
  },
  profileEnd() {
  },
  timeStamp() {
  },
  setPretty(pretty) {
    ConsoleUtils.pretty = !!pretty;
  },
  mapStackTrace(stackTrace) {
    return StacktraceResolver.mapStackTrace(stackTrace);
  }
};
var StacktraceResolver = class _StacktraceResolver {
  static sourcmapReader;
  static map;
  static {
    import(`${imports.package.moduledir}/main.js.map`).then((main) => {
      const map = JSON.parse(main.map);
      _StacktraceResolver.map = map;
      _StacktraceResolver.sourcmapReader = new SourceMapReader(map, map.root);
    }).catch((error) => {
    });
  }
  static mapStackTrace(stack) {
    if (!_StacktraceResolver.sourcmapReader) {
      return stack;
    }
    const lines = stack.split(EOL);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/main.js:\d+:\d+$/);
      if (match) {
        const lineCol = line.split("/main.js:").pop();
        const [lineNo, colNo] = lineCol.split(":");
        const l = Number(lineNo) - this.map.rowOffset;
        const c = Number(colNo) - this.map.colOffset;
        const org = _StacktraceResolver.sourcmapReader.getOriginalPosition(l, c);
        if (org && org.file) {
          if (org.file.startsWith(_StacktraceResolver.map.wd)) {
            org.file = "./" + org.file.substring(_StacktraceResolver.map.wd.length + 1);
          }
          if (org.symbolName == null) {
            if (line.match(/^[\w\d]+@/)) {
              org.symbolName = line.split("@")[0];
            }
          }
          if (org.symbolName) {
            lines[i] = `${org.symbolName} at ${org.file}:${org.line}:${org.column}`;
          } else {
            lines[i] = `at ${org.file}:${org.line}:${org.column}`;
          }
        }
      }
    }
    return lines.join(EOL);
  }
};
export {
  Console as __console_proxy
};
