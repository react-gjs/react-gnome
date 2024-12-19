import { registerGlobal } from "./helpers/register-global";

declare const __console_proxy: Console;

(() => {
  const EOL = "\n";

  function handleTimerCbError(e: unknown, type: string, stack?: string) {
    const stackFmtd = stack
      ? __console_proxy.formatStackTrace(
        __console_proxy.mapStackTrace(stack),
        2,
      )
      : "Stack trace not available";
    __console_proxy.error(
      e,
      `${EOL}${EOL}The above error occured in a callback provided to ${type} in here:${EOL}${stackFmtd}`,
    );
  }

  function runWithErrorHandler(cb: Function, type: string, stack?: string) {
    try {
      const res = cb();
      if (res instanceof Promise) {
        res.catch((e) => handleTimerCbError(e, type, stack));
      }
    } catch (e) {
      handleTimerCbError(e, type, stack);
    }
  }

  type TimerFunc = (cb: Function, time: number) => void;

  registerGlobal("__setInterval_proxy", () => {
    // grab the real setTimeout function
    // @ts-expect-error
    const impl = globalThis["set" + "Interval"] as TimerFunc;
    function setIntervalProxy(cb: Function, time: number) {
      const stack = new Error().stack?.split(EOL).slice(1).join(EOL);
      impl(() => {
        runWithErrorHandler(cb, "setInterval", stack);
      }, time);
    }
    return setIntervalProxy;
  });

  registerGlobal("__setTimeout_proxy", () => {
    // grab the real setTimeout function
    // @ts-expect-error
    const impl = globalThis["set" + "Timeout"] as TimerFunc;
    function setTimeoutProxy(cb: Function, time: number) {
      const stack = new Error().stack?.split(EOL).slice(1).join(EOL);
      impl(() => {
        runWithErrorHandler(cb, "setTimeout", stack);
      }, time);
    }
    return setTimeoutProxy;
  });
})();
