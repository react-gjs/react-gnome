import { registerPolyfills } from "./shared/polyfill-global";

registerPolyfills("queueMicrotask")(() => {
  let onNextMicrotask: Array<() => void> | undefined;

  function queueMicrotask(task: () => void) {
    if (onNextMicrotask) {
      onNextMicrotask.push(task);
    }

    onNextMicrotask = [task];

    imports.mainloop.idle_add(() => {
      if (!onNextMicrotask) return;
      const tasks = onNextMicrotask;
      onNextMicrotask = undefined;
      for (const task of tasks!) {
        try {
          task();
        } catch (e) {
          console.error(e);
        }
      }
    }, -2000);
  }

  return { queueMicrotask };
});
