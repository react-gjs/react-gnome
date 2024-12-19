import Gio from "gi://Gio";
import GLib from "gi://GLib?version=2.0";
import { registerGlobal } from "./helpers/register-global";
import { SourceMap, SourceMapReader } from "./helpers/sourcemap-reader";

type AppSourceMaps = SourceMap & {
  rowOffset: number;
  colOffset: number;
  root: string;
  wd: string;
};

declare global {
  const __MODE__: "development" | "production";
  const __SOURCE_MAPS_ENABLED__: boolean;
}

registerGlobal("__console_proxy", () => {
  const EOL = "\n";

  const COLOR = {
    // info labels colors
    Red: "\u001b[38;5;196m",
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

    // error formatting
    RedMsg: "\u001b[38;5;160m",
    CyanStack: "\u001b[38;5;117m",
    CausedByGrey: "\u001b[38;5;247m",

    Dim: "\u001b[38;5;241m",
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

  function errMessageRed(text: string) {
    if (!ConsoleUtils.pretty) return text;
    return `${COLOR.RedMsg}${text}${COLOR.Reset}`;
  }

  function stackTraceCyan(text: string) {
    if (!ConsoleUtils.pretty) return text;
    return `${COLOR.CyanStack}${text}${COLOR.Reset}`;
  }

  function causedByGrey(text: string) {
    if (!ConsoleUtils.pretty) return text;
    return `${COLOR.CausedByGrey}${text}${COLOR.Reset}`;
  }

  function dim(text: string) {
    if (!ConsoleUtils.pretty) return text;
    return `${COLOR.Dim}${text}${COLOR.Reset}`;
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
    return "͏ ".repeat(indent * indentSize);
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

  class Formatter {
    static error(err: Error | GLib.Error, ctx: FmtContext): string {
      const trace = StacktraceResolver.mapStackTrace(err.stack?.trim() ?? "");
      const msg = errMessageRed(`${err.name}: ${err.message}`);
      const str = `${msg}${EOL}${
        err.stack ? stackTraceCyan(trace) : "No stack trace available"
      }`;

      if ("cause" in err && err.cause != null) {
        const causeFmtd = addIndent(
          Formatter.auto(err.cause, {
            ...ctx,
            depth: 1,
          }),
          2,
        );
        return `${str}${EOL}${EOL}${
          causedByGrey("Caused by:")
        }${EOL}${causeFmtd}`;
      }

      return str;
    }

    static key(key: unknown): string {
      switch (typeof key) {
        case "number":
        case "boolean":
          return String(key);
        case "bigint":
          return `${key}n`;
        case "string":
          return JSON.stringify(key);
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

    static map(map: Map<unknown, unknown>, ctx: FmtContext): string {
      const indent = makeIndent(ctx.depth);

      ctx.parentRefs.set(map, ctx.currentLocation);

      let fmtd = `Map${bracket("<", ctx.depth)}${EOL}`;
      for (let [key, value] of map) {
        key = Formatter.key(key);
        const nextCtx: FmtContext = {
          parentRefs: ctx.parentRefs,
          depth: ctx.depth + 1,
          currentLocation: `${ctx.currentLocation}.${key}`,
        };
        const fmtv = Formatter.auto(value, nextCtx);
        fmtd += `${indent}${keyClr(String(key))}: ${fmtv},${EOL}`;
      }
      fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;

      ctx.parentRefs.delete(map);

      return fmtd;
    }

    static set(set: Set<unknown>, ctx: FmtContext): string {
      const indent = makeIndent(ctx.depth);

      ctx.parentRefs.set(set, ctx.currentLocation);

      let fmtd = `Set${bracket("<", ctx.depth)}${EOL}`;
      for (const value of set) {
        const nextCtx: FmtContext = {
          parentRefs: ctx.parentRefs,
          depth: ctx.depth + 1,
          currentLocation: `${ctx.currentLocation}.<SetEntry>`,
        };
        const fmtv = Formatter.auto(value, nextCtx);
        fmtd += `${indent}${fmtv},${EOL}`;
      }
      fmtd += `${makeIndent(ctx.depth - 1)}${bracket(">", ctx.depth)}`;

      ctx.parentRefs.delete(set);

      return fmtd;
    }

    static array(arr: Array<unknown> | TypedArray, ctx: FmtContext): string {
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
        const fmtv = Formatter.auto(value, nextCtx);
        entries.push(fmtv);
      }
      let fmtd = bracket("[", ctx.depth);
      const totalEntriesLen = entries.reduce((sum, e) => sum + e.length, 0);
      if (totalEntriesLen < 28) {
        fmtd += `${entries.join(", ")}${bracket("]", ctx.depth)}`;
      } else {
        fmtd += `${EOL}${
          entries
            .map((e) => `${indent}${e}`)
            .join(
              `,${EOL}`,
            )
        },${EOL}${makeIndent(ctx.depth - 1)}${bracket("]", ctx.depth)}`;
      }

      ctx.parentRefs.delete(arr);

      return fmtd;
    }

    static typedArray(arr: TypedArray, ctx: FmtContext): string {
      const typedArrayName = arr.constructor.name;
      return `${typedArrayName} ${Formatter.array(arr, ctx)}`;
    }

    static plainObject(obj: Record<any, unknown>, ctx: FmtContext): string {
      const indent = makeIndent(ctx.depth);

      ctx.parentRefs.set(obj, ctx.currentLocation);

      let fmtd = "";

      const consturctor = Formatter.constructorName(obj);
      if (consturctor) {
        fmtd += dim(consturctor) + " ";
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
          const fmtv = Formatter.auto(value, nextCtx);
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

    static object(obj: object, ctx: FmtContext): string {
      try {
        if (ctx.parentRefs.has(obj)) {
          let ref = ctx.parentRefs.get(obj) ?? "";
          if (ref?.length == 0) ref = "$";
          return `## Recursive reference to: ${ref} ##`;
        }

        if (this.excedesDepth(ctx)) {
          if (obj instanceof Error || obj instanceof GLib.Error) {
            return `Error<...>`;
          }
          if (obj instanceof Map) {
            return `Map<...>`;
          }
          if (obj instanceof Set) {
            return `Set<...>`;
          }
          if (isTypedArray(obj)) {
            return `TypedArray<...>`;
          }
          if (isArray(obj)) {
            return `Array<...>`;
          }

          const consturctor = Formatter.constructorName(obj);
          if (consturctor) {
            return consturctor + "<...>";
          }

          return `Object<...>`;
        } else {
          if (
            "toConsolePrint" in obj && typeof obj.toConsolePrint === "function"
          ) {
            const objStr = obj.toConsolePrint();
            if (typeof objStr === "string") {
              return addIndent(objStr, ctx.depth, 1);
            }
          }

          if (obj instanceof Error || obj instanceof GLib.Error) {
            return addIndent(
              Formatter.error(obj, ctx),
              ctx.depth * 2,
              1,
            );
          }
          if (obj instanceof Map) {
            return Formatter.map(obj, ctx);
          }
          if (obj instanceof Set) {
            return Formatter.set(obj, ctx);
          }
          if (isTypedArray(obj)) {
            return Formatter.typedArray(obj, ctx);
          }
          if (isArray(obj)) {
            return Formatter.array(obj, ctx);
          }
          return Formatter.plainObject(obj as any, ctx);
        }
      } catch (err) {
        setTimeout(() => {
          Console.error(err);
        }, 0);
        return "## Failed to print the object due to an error ##";
      }
    }

    /**
     * Automatically detect the value type and format it accordingly.
     */
    static auto(
      item: unknown,
      ctx: FmtContext = {
        depth: 1,
        parentRefs: new Map(),
        currentLocation: "",
      },
    ): string {
      switch (typeof item) {
        case "number":
        case "boolean":
          return String(item);
        case "bigint":
          return `${item}n`;
        case "string":
          if (ctx.depth === 1) {
            return item;
          }
          return JSON.stringify(item);
        case "function":
          return `[Function ${item.name}]`;
        case "symbol":
          return `[Symbol ${item.toString()}]`;
        case "undefined":
          return "undefined";
        case "object": {
          if (item === null) return "null";
          return Formatter.object(item, ctx);
        }
      }
    }

    private static excedesDepth(ctx: FmtContext) {
      return ConsoleUtils.maxObjectDepth > 0
        && ctx.depth > ConsoleUtils.maxObjectDepth;
    }

    private static constructorName(obj: object) {
      if ("constructor" in obj && obj.constructor.name !== "Object") {
        return obj.constructor.name;
        // @ts-expect-error
      } else if (obj[Symbol.toStringTag] === "GIRepositoryNamespace") {
        // @ts-expect-error
        return `[${obj[Symbol.toStringTag]} ${obj.__name__}]`;
      }
    }
  }

  function formatArgs(args: unknown[]) {
    args = args.slice();
    for (let i = 0; i < args.length; i++) {
      const value = args[i];
      args[i] = Formatter.auto(value);
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
      typeof value === "number"
      || typeof value === "bigint"
      || (typeof value === "string" && NUM_REGEX.test(value))
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
    private static groupIndent = 0;
    private static counters = new Map<unknown, number>();
    private static timers = new Map<unknown, number>();
    private static logListeners: Array<
      (logType: LogLevel, message: string) => {}
    > = [];
    static maxObjectDepth = 0;
    static pretty = __MODE__ === "development";

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
      this.groupIndent = 0;
    }

    static enterGroup() {
      this.groupIndent++;
    }

    static leaveGroup() {
      this.groupIndent = Math.max(0, this.groupIndent - 1);
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

    static addLogListener(
      listener: (logType: LogLevel, message: string) => {},
    ) {
      this.logListeners.push(listener);
    }

    static removeLogListener(
      listener: (logType: LogLevel, message: string) => {},
    ) {
      const index = this.logListeners.indexOf(listener);
      if (index !== -1) {
        this.logListeners.splice(index, 1);
      }
    }

    static logger(
      logLevel: LogLevel,
      args: unknown[],
      options: PrinterOptions = {},
    ) {
      if (args.length === 0) {
        this.print(logLevel, [], options);
        return;
      }

      if (args.length === 1) {
        this.print(logLevel, formatArgs(args), options);
        return undefined;
      }

      const [first, ...rest] = args;

      // If first does not contain any format specifiers, don't call Formatter
      if (typeof first !== "string" || !hasFormatSpecifiers(first)) {
        this.print(logLevel, formatArgs(args), options);
        return undefined;
      }

      // Otherwise, perform print the result of Formatter.
      this.print(logLevel, this.sprintf([first, ...rest]), options);

      return undefined;
    }

    static sprintf(args: unknown[]): unknown[] {
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
          converted = Formatter.auto(current);
          break;
        case "%O":
          converted = Formatter.auto(current);
          break;
        case "%c":
          converted = "";
          break;
      }
      // If any of the previous steps set converted, replace the specifier in
      // target with the converted value.
      if (converted !== null) {
        target = target.slice(0, specifierIndex)
          + converted
          + target.slice(specifierIndex + 2);
      }

      if (!hasFormatSpecifiers(target)) {
        return [target, ...formatArgs(args.slice(2))];
      }

      const result = [target, ...args.slice(2)];

      if (result.length === 1) return result;

      return this.sprintf(result);
    }

    static print(
      logLevel: LogLevel,
      args: unknown[],
      options: PrinterOptions = {},
    ) {
      let formattedOutput = addIndent(
        addLogPrefix(logLevel, args.map(String).join(" ")),
        this.groupIndent * 2,
        0,
      );
      let stackTraceLines = options?.stackTrace
        ? StacktraceResolver
          .mapStackTrace(options.stackTrace)
          .split(EOL)
        : [];

      if (logLevel === LogLevel.Trace) {
        if (stackTraceLines.length) {
          formattedOutput += `${EOL}${
            addIndent(
              stackTraceLines.join(EOL),
              (this.groupIndent * 2) + 2,
            )
          }`;
        } else {
          formattedOutput += `${EOL}${
            addIndent(
              "No stack trace available",
              (this.groupIndent * 2) + 2,
            )
          }`;
        }
      }

      if (__MODE__ === "development") {
        print(formattedOutput);
      } else {
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
          case LogLevel.Error:
          case LogLevel.Assert:
            severity = GLib.LogLevelFlags.LEVEL_CRITICAL;
            break;
          default:
            severity = GLib.LogLevelFlags.LEVEL_MESSAGE;
        }

        // @ts-expect-error
        GLib.log_structured("ReactGTK", severity, {
          MESSAGE: formattedOutput,
        });
      }

      for (const listener of this.logListeners) {
        try {
          listener(logLevel, formattedOutput);
        } catch (err) {
          print(`Error in log listener: ${String(err)}`);
        }
      }
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
      const stackTrace = new Error("trace").stack?.split(EOL).slice(1).join(
        EOL,
      );
      ConsoleUtils.logger(LogLevel.Trace, data, { stackTrace });
    },

    warn(...data: unknown[]) {
      ConsoleUtils.logger(LogLevel.Warn, data);
    },

    dir(item: unknown, options: never) {
      const object = Formatter.auto(item);
      ConsoleUtils.print(LogLevel.Dir, [object], options);
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
      ConsoleUtils.logger(LogLevel.Group, data);
      ConsoleUtils.enterGroup();
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

      ConsoleUtils.print(LogLevel.TimeLog, data);
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
      ConsoleUtils.print(LogLevel.TimeEnd, [msg]);
    },

    profile() {},

    profileEnd() {},

    timeStamp() {},

    setPretty(pretty: boolean) {
      ConsoleUtils.pretty = !!pretty;
    },

    setMaxDepth(depth: number) {
      ConsoleUtils.maxObjectDepth = Math.max(0, Math.round(depth));
    },

    mapStackTrace(stackTrace: string) {
      return StacktraceResolver.mapStackTrace(stackTrace);
    },

    formatStackTrace(stackTrace: string, indent?: number) {
      let fmtd = stackTraceCyan(stackTrace);
      if (indent != null) {
        fmtd = fmtd
          .split(EOL)
          .map(line => line.trimStart())
          .join(EOL);
        fmtd = addIndent(fmtd, indent);
      }
      return fmtd;
    },

    format(any: any): string {
      return Formatter.auto(any);
    },

    onLogPrinted(cb: (logType: LogLevel, message: string) => {}) {
      ConsoleUtils.addLogListener(cb);
      return () => {
        ConsoleUtils.removeLogListener(cb);
      };
    },
  };

  class StacktraceResolver {
    static sourcmapReader?: SourceMapReader;
    static map: AppSourceMaps;

    static {
      if (__SOURCE_MAPS_ENABLED__) {
        try {
          const file = Gio.File.new_for_uri(
            `${imports.package.moduledir}/main.js.map`,
          );
          const [bytes] = file.load_bytes(null);
          const arr = bytes.toArray();
          const content = new TextDecoder().decode(arr);
          const map = JSON.parse(content) as AppSourceMaps;
          StacktraceResolver.map = map;
          StacktraceResolver.sourcmapReader = new SourceMapReader(
            map,
            map.root,
          );
        } catch {}
      }
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
          const org = StacktraceResolver.sourcmapReader.getOriginalPosition(
            l,
            c,
          );
          if (org && org.file) {
            if (org.file.startsWith(StacktraceResolver.map.wd)) {
              org.file = "./"
                + org.file.substring(StacktraceResolver.map.wd.length + 1);
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

  return Console;
});
