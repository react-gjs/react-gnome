// src/polyfills/fs.ts
import fspromises from "./fs-promises.mjs";
var fs;
((fs2) => {
  function depromisify(fn) {
    const depromisifiedFn = function (...args) {
      const callback =
        typeof args[args.length - 1] === "function" ? args.pop() : () => {};
      fn(...args).then(
        (result) => callback(null, result),
        (error) => callback(error)
      );
    };
    Object.assign(depromisifiedFn, { __promisify__: fn });
    return depromisifiedFn;
  }
  fs2.appendFile = depromisify(fspromises.appendFile);
  fs2.chmod = depromisify(fspromises.chmod);
  fs2.chown = depromisify(fspromises.chown);
  fs2.constants = fspromises.constants;
  fs2.copyFile = depromisify(fspromises.copyFile);
  fs2.cp = depromisify(fspromises.cp);
  fs2.lstat = depromisify(fspromises.lstat);
  fs2.mkdir = depromisify(fspromises.mkdir);
  fs2.open = depromisify(fspromises.open);
  fs2.readdir = depromisify(fspromises.readdir);
  fs2.readFile = depromisify(fspromises.readFile);
  fs2.rename = depromisify(fspromises.rename);
  fs2.rm = depromisify(fspromises.rm);
  fs2.stat = depromisify(fspromises.stat);
  fs2.unlink = depromisify(fspromises.unlink);
  fs2.writeFile = depromisify(fspromises.writeFile);
})(fs || (fs = {}));
var fs_default = fs;
var appendFile = fs.appendFile;
var chmod = fs.chmod;
var chown = fs.chown;
var constants = fs.constants;
var copyFile = fs.copyFile;
var cp = fs.cp;
var lstat = fs.lstat;
var mkdir = fs.mkdir;
var open = fs.open;
var readdir = fs.readdir;
var readFile = fs.readFile;
var rename = fs.rename;
var rm = fs.rm;
var stat = fs.stat;
var unlink = fs.unlink;
var writeFile = fs.writeFile;
export {
  appendFile,
  chmod,
  chown,
  constants,
  copyFile,
  cp,
  fs_default as default,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
};
