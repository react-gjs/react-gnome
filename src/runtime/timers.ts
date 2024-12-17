declare const __console_proxy: Console;

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

function __setTimeout_proxy(cb: Function, time: number) {
  const stack = new Error().stack?.split(EOL).slice(1).join(EOL);
  setTimeout(() => {
    runWithErrorHandler(cb, "setTimeout", stack);
  }, time);
}

function __setInterval_proxy(cb: Function, time: number) {
  const stack = new Error().stack?.split(EOL).slice(1).join(EOL);
  setInterval(() => {
    runWithErrorHandler(cb, "setInterval", stack);
  }, time);
}

export { __setInterval_proxy, __setTimeout_proxy };
