import type { FileInfo } from "fs-gjs";
import { SyncFs } from "fs-gjs";
import type fst from "node:fs";
import fspromises from "./fs-promises";
import { ArgTypeError, FsError } from "./shared/fs-errors";

namespace fs {
  type AsyncFunction<A extends any[] = any[], R = any> = (
    ...args: A
  ) => Promise<R>;

  interface FnWithCallback<A extends any[], R> {
    (...args: [...A, Callback<R>]): void;
    __promisify__: AsyncFunction<A, R>;
  }

  type Callback<R> = (err: any, result?: R) => void;

  type Last<A extends any[]> = 5 extends A["length"]
    ? A[4]
    : 4 extends A["length"]
    ? A[3]
    : 3 extends A["length"]
    ? A[2]
    : 2 extends A["length"]
    ? A[1]
    : A[0];

  type Poped<A extends any[]> = 5 extends A["length"]
    ? [A[0], A[1], A[2], A[3]]
    : 4 extends A["length"]
    ? [A[0], A[1], A[2]]
    : 3 extends A["length"]
    ? [A[0], A[1]]
    : 2 extends A["length"]
    ? [A[0]]
    : [];

  type Depromisified<
    A extends any[] = any[],
    R = any,
  > = undefined extends Last<A>
    ? Depromisified<Poped<A>, R> & FnWithCallback<A, R>
    : FnWithCallback<A, R>;

  function _depromisify<A extends any[], R>(
    fn: AsyncFunction<A, R>,
  ): Depromisified<A, R> {
    return Object.assign(
      function (...args: [...A, Callback<R>]) {
        const callback =
          typeof args[args.length - 1] === "function"
            ? (args.pop() as Callback<R>)
            : null;

        if (callback === null) {
          throw new ArgTypeError("Missing callback argument");
        }

        // @ts-expect-error
        fn(...args).then(
          (result) =>
            result !== undefined ? callback(null, result) : callback(null),
          (error) => callback(error),
        );
      },
      { __promisify__: fn },
    ) as any;
  }

  export const constants = fspromises.constants;

  export const access = _depromisify(fspromises.access);
  export const appendFile = _depromisify(fspromises.appendFile);
  export const chmod = _depromisify(fspromises.chmod);
  export const chown = _depromisify(fspromises.chown);
  export const copyFile = _depromisify(fspromises.copyFile);
  export const cp = _depromisify(fspromises.cp);
  export const lchmod = _depromisify(fspromises.lchmod);
  export const lchown = _depromisify(fspromises.lchown);
  export const link = _depromisify(fspromises.link);
  export const lstat = _depromisify(fspromises.lstat);
  export const mkdir = _depromisify(fspromises.mkdir);
  export const open = _depromisify(fspromises.open);
  export const readdir = _depromisify(fspromises.readdir);
  export const readFile = _depromisify(fspromises.readFile);
  export const readlink = _depromisify(fspromises.readlink);
  export const realpath = _depromisify(fspromises.realpath);
  export const rename = _depromisify(fspromises.rename);
  export const rm = _depromisify(fspromises.rm);
  export const rmdir = _depromisify(fspromises.rmdir);
  export const stat = _depromisify(fspromises.stat);
  export const symlink = _depromisify(fspromises.symlink);
  export const unlink = _depromisify(fspromises.unlink);
  export const writeFile = _depromisify(fspromises.writeFile);

  export const Dirent = fspromises.Dirent;
  export const Stats = fspromises.Stats;

  function _modeNum(m: any): number | undefined;
  function _modeNum(m: any, def: string | number): number;
  function _modeNum(m: any, def?: any): number | undefined {
    switch (typeof m) {
      case "number":
        return m;
      case "string":
        return parseInt(m, 8);
      default:
        if (def) {
          return _modeNum(def);
        } else {
          return undefined;
        }
    }
  }

  function _fileInfoToStats(fileInfo: FileInfo): InstanceType<typeof Stats> {
    const stats: Partial<InstanceType<typeof Stats>> = {
      isFile: () => fileInfo.isFile,
      isDirectory: () => fileInfo.isDirectory,
      isSymbolicLink: () => fileInfo.isSymlink,
      dev: fileInfo._gioInfo.get_attribute_uint32("unix::device"),
      ino: Number(fileInfo._gioInfo.get_attribute_as_string("unix::inode")),
      rdev: fileInfo._gioInfo.get_attribute_uint32("unix::rdev"),
      blksize: fileInfo.blockSize,
      blocks: fileInfo.blocks,
      mode: fileInfo._gioInfo.get_attribute_uint32("unix::mode"),
      nlink: fileInfo._gioInfo.get_attribute_uint32("unix::nlink"),
      uid: fileInfo.uid,
      gid: fileInfo.gid,
      size: fileInfo.size,
      atimeMs: fileInfo.accessTime,
      mtimeMs: fileInfo.modifiedTime,
      ctimeMs: fileInfo.changedTime,
      birthtimeMs: fileInfo.createdTime,
      atime: new Date(fileInfo.accessTime),
      mtime: new Date(fileInfo.modifiedTime),
      ctime: new Date(fileInfo.changedTime),
      birthtime: new Date(fileInfo.createdTime),
    };

    return Object.assign(new Stats(), stats);
  }

  function _fileInfoToDirent(fileInfo: FileInfo): InstanceType<typeof Dirent> {
    return Object.assign(new Dirent(), {
      name: fileInfo.filename,
      isFile: () => fileInfo.isFile,
      isDirectory: () => fileInfo.isDirectory,
      isSymbolicLink: () => fileInfo.isSymlink,
    });
  }

  function _ensureWriteableData(
    data: any,
  ): asserts data is Uint8Array | Buffer | string {
    if (typeof data === "string") {
      return;
    } else if (typeof data === "object" && data !== null) {
      if (data instanceof Uint8Array || data instanceof Buffer) {
        return;
      }
    }

    throw new Error(
      "Cannot write to the file. Written data must be a string, Buffer or Uint8Array.",
    );
  }

  function _checkFlag(flags: number, flag: number) {
    return (flags & flag) === flag;
  }

  function _asUintArray(data: Buffer | Uint8Array): Uint8Array {
    if (data instanceof Buffer) {
      return data.valueOf();
    } else {
      return data;
    }
  }

  export const accessSync: typeof fst.accessSync = (
    path,
    mode = constants.F_OK,
  ) => {
    try {
      const info = SyncFs.fileInfo(path.toString());

      if (_checkFlag(mode, constants.R_OK) && !info.canRead) {
        throw new FsError(
          "Permission denied [read]",
          "EACCES",
          path.toString(),
        );
      }

      if (_checkFlag(mode, constants.W_OK) && !info.canWrite) {
        throw new FsError(
          "Permission denied [write]",
          "EACCES",
          path.toString(),
        );
      }

      if (_checkFlag(mode, constants.X_OK) && !info.canExecute) {
        throw new FsError(
          "Permission denied [execute]",
          "EACCES",
          path.toString(),
        );
      }
    } catch (err) {
      if (err instanceof FsError) {
        throw err;
      }

      throw new FsError(
        "No such file or directory.",
        "ENOENT",
        path.toString(),
        err,
      );
    }
  };

  export const writeFileSync: typeof fst.writeFileSync = (
    path,
    data,
    options,
  ) => {
    _ensureWriteableData(data);

    const encoding =
      (typeof options === "object" ? options?.encoding : options) ?? "utf8";

    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return SyncFs.writeFile(path.toString(), encoded);
    }

    return SyncFs.writeFile(path.toString(), _asUintArray(data));
  };

  export const appendFileSync: typeof fst.appendFileSync = (
    path,
    data,
    options,
  ) => {
    _ensureWriteableData(data);

    const encoding =
      (typeof options === "object" ? options?.encoding : options) ?? "utf8";

    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return SyncFs.appendFile(path.toString(), encoded);
    }

    return SyncFs.appendFile(path.toString(), _asUintArray(data));
  };

  export const readFileSync: typeof fst.readFileSync = (path, options): any => {
    const encoding = typeof options === "string" ? options : options?.encoding;

    const data = SyncFs.readFile(path.toString());

    if (encoding) {
      return Buffer.from(data).toString(encoding);
    }

    return Buffer.from(data);
  };

  export const mkdirSync: typeof fst.mkdirSync = (path): any => {
    return SyncFs.makeDir(path.toString());
  };

  export const renameSync: typeof fst.renameSync = (oldPath, newPath) => {
    return SyncFs.moveFile(oldPath.toString(), newPath.toString());
  };

  export const copyFileSync: typeof fst.copyFileSync = (src, dest) => {
    return SyncFs.copyFile(src.toString(), dest.toString());
  };

  export const unlinkSync: typeof fst.unlinkSync = (path) => {
    return SyncFs.deleteFile(path.toString(), { followSymlinks: false });
  };

  export const rmdirSync: typeof fst.rmdirSync = (path, options) => {
    return SyncFs.deleteFile(path.toString(), {
      recursive: options?.recursive,
    });
  };

  export const rmSync: typeof fst.rmSync = (path, options) => {
    return SyncFs.deleteFile(path.toString(), {
      recursive: options?.recursive,
    });
  };

  export const chmodSync: typeof fst.chmodSync = (path, mode) => {
    return SyncFs.chmod(path.toString(), _modeNum(mode, 0o755), {
      followSymlinks: true,
    });
  };

  export const chownSync: typeof fst.chownSync = (path, uid, gid) => {
    return SyncFs.chown(path.toString(), uid, gid, { followSymlinks: true });
  };

  export const lchmodSync: typeof fst.chmodSync = (path, mode) => {
    return SyncFs.chmod(path.toString(), _modeNum(mode, 0o755), {
      followSymlinks: false,
    });
  };

  export const lchownSync: typeof fst.chownSync = (path, uid, gid) => {
    return SyncFs.chown(path.toString(), uid, gid, { followSymlinks: false });
  };

  export const readdirSync: typeof fst.readdirSync = (path, options): any => {
    const withFileTypes =
      typeof options === "object" && options != null
        ? options.withFileTypes ?? false
        : false;

    if (withFileTypes) {
      return SyncFs.listDir(path.toString()).map(_fileInfoToDirent);
    }

    return SyncFs.listFilenames(path.toString());
  };

  export const readlinkSync: typeof fst.readlinkSync = (path, options): any => {
    const info = SyncFs.fileInfo(path.toString(), { followSymlinks: false });

    if (!info.isSymlink || !info.symlinkTarget) {
      throw new Error("Not a symlink");
    }

    const encoding =
      (typeof options === "object" ? options?.encoding : options) ?? "utf8";

    if (encoding === "buffer") {
      return Buffer.from(info.symlinkTarget);
    }

    return info.symlinkTarget;
  };

  export const statSync: typeof fst.statSync = (path): any => {
    return _fileInfoToStats(
      SyncFs.fileInfo(path.toString(), { followSymlinks: true }),
    );
  };

  export const lstatSync: typeof fst.lstatSync = (path): any => {
    return _fileInfoToStats(
      SyncFs.fileInfo(path.toString(), { followSymlinks: false }),
    );
  };

  export const symlinkSync: typeof fst.symlinkSync = (target, path): any => {
    return SyncFs.makeLink(path.toString(), target.toString());
  };

  // @ts-expect-error
  export const realpathSync: typeof fst.realpathSync = (path, options): any => {
    const info = SyncFs.fileInfo(path.toString(), { followSymlinks: true });

    const encoding = typeof options === "string" ? options : options?.encoding;

    if (encoding === "buffer") {
      return Buffer.from(info.filepath);
    }

    return info.filepath;
  };

  export const cpSync = copyFileSync;
  export const linkSync = symlinkSync;
}

export default fs;

export const constants = fs.constants;

export const access = fs.access;
export const appendFile = fs.appendFile;
export const chmod = fs.chmod;
export const chown = fs.chown;
export const copyFile = fs.copyFile;
export const cp = fs.cp;
export const lchmod = fs.lchmod;
export const lchown = fs.lchown;
export const link = fs.link;
export const lstat = fs.lstat;
export const mkdir = fs.mkdir;
export const open = fs.open;
export const readdir = fs.readdir;
export const readFile = fs.readFile;
export const readlink = fs.readlink;
export const realpath = fs.realpath;
export const rename = fs.rename;
export const rm = fs.rm;
export const rmdir = fs.rmdir;
export const stat = fs.stat;
export const symlink = fs.symlink;
export const unlink = fs.unlink;
export const writeFile = fs.writeFile;

export const Dirent = fs.Dirent;
export const Stats = fs.Stats;

export const accessSync = fs.accessSync;
export const writeFileSync = fs.writeFileSync;
export const appendFileSync = fs.appendFileSync;
export const readFileSync = fs.readFileSync;
export const mkdirSync = fs.mkdirSync;
export const renameSync = fs.renameSync;
export const copyFileSync = fs.copyFileSync;
export const unlinkSync = fs.unlinkSync;
export const rmdirSync = fs.rmdirSync;
export const rmSync = fs.rmSync;
export const chmodSync = fs.chmodSync;
export const chownSync = fs.chownSync;
export const lchmodSync = fs.lchmodSync;
export const lchownSync = fs.lchownSync;
export const readdirSync = fs.readdirSync;
export const readlinkSync = fs.readlinkSync;
export const statSync = fs.statSync;
export const lstatSync = fs.lstatSync;
export const symlinkSync = fs.symlinkSync;
export const realpathSync = fs.realpathSync;
export const cpSync = fs.cpSync;
export const linkSync = fs.linkSync;
