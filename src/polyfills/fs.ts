import fspromises from "./fs-promises";

namespace fs {
  type AsyncFunction<A extends any[] = any[], R = any> = (
    ...args: A
  ) => Promise<R>;

  function depromisify<A extends any[], R, F extends AsyncFunction<A, R>>(
    fn: F
  ) {
    type Callback = (err: any, result?: R) => void;

    const depromisifiedFn = function (...args: [...A, Callback]) {
      const callback =
        typeof args[args.length - 1] === "function"
          ? (args.pop() as Callback)
          : () => {};

      // @ts-expect-error
      fn(...args).then(
        (result) => callback(null, result),
        (error) => callback(error)
      );
    };

    Object.assign(depromisifiedFn, { __promisify__: fn });

    return depromisifiedFn;
  }

  export const appendFile = depromisify(fspromises.appendFile);
  export const chmod = depromisify(fspromises.chmod);
  export const chown = depromisify(fspromises.chown);
  export const constants = fspromises.constants;
  export const copyFile = depromisify(fspromises.copyFile);
  export const cp = depromisify(fspromises.cp);
  export const lstat = depromisify(fspromises.lstat);
  export const mkdir = depromisify(fspromises.mkdir);
  export const open = depromisify(fspromises.open);
  export const readdir = depromisify(fspromises.readdir);
  export const readFile = depromisify(fspromises.readFile);
  export const rename = depromisify(fspromises.rename);
  export const rm = depromisify(fspromises.rm);
  export const stat = depromisify(fspromises.stat);
  export const unlink = depromisify(fspromises.unlink);
  export const writeFile = depromisify(fspromises.writeFile);
}

export default fs;

export const appendFile = fs.appendFile;
export const chmod = fs.chmod;
export const chown = fs.chown;
export const constants = fs.constants;
export const copyFile = fs.copyFile;
export const cp = fs.cp;
export const lstat = fs.lstat;
export const mkdir = fs.mkdir;
export const open = fs.open;
export const readdir = fs.readdir;
export const readFile = fs.readFile;
export const rename = fs.rename;
export const rm = fs.rm;
export const stat = fs.stat;
export const unlink = fs.unlink;
export const writeFile = fs.writeFile;
