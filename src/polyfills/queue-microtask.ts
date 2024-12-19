import { registerPolyfills } from "./shared/polyfill-global";

declare const __console_proxy: Console;

registerPolyfills("queueMicrotask")(() => {
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

  let onNextMicrotask: Array<() => void> | undefined;

  function queueMicrotask(task: () => void) {
    const stack = new Error().stack?.split(EOL).slice(1).join(EOL);

    if (onNextMicrotask) {
      onNextMicrotask.push(task);
    }

    onNextMicrotask = [task];

    imports.mainloop.idle_add(() => {
      if (!onNextMicrotask) return;
      const tasks = onNextMicrotask;
      onNextMicrotask = undefined;
      for (const task of tasks!) {
        runWithErrorHandler(task, "queueMicrotask", stack);
      }
    }, -2000);
  }

  return { queueMicrotask };
});
