// src/polyfills/fs.ts
import { SyncFs } from "fs-gjs";
import fspromises from "./fs-promises.mjs";
import { ArgTypeError, FsError } from "./shared/fs-errors.mjs";
var fs;
((fs2) => {
  function _depromisify(fn) {
    return Object.assign(
      function(...args) {
        const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
        if (callback === null) {
          throw new ArgTypeError("Missing callback argument");
        }
        fn(...args).then(
          (result) => result !== void 0 ? callback(null, result) : callback(null),
          (error) => callback(error)
        );
      },
      { __promisify__: fn }
    );
  }
  fs2.constants = fspromises.constants;
  fs2.access = _depromisify(fspromises.access);
  fs2.appendFile = _depromisify(fspromises.appendFile);
  fs2.chmod = _depromisify(fspromises.chmod);
  fs2.chown = _depromisify(fspromises.chown);
  fs2.copyFile = _depromisify(fspromises.copyFile);
  fs2.cp = _depromisify(fspromises.cp);
  fs2.lchmod = _depromisify(fspromises.lchmod);
  fs2.lchown = _depromisify(fspromises.lchown);
  fs2.link = _depromisify(fspromises.link);
  fs2.lstat = _depromisify(fspromises.lstat);
  fs2.mkdir = _depromisify(fspromises.mkdir);
  fs2.open = _depromisify(fspromises.open);
  fs2.readdir = _depromisify(fspromises.readdir);
  fs2.readFile = _depromisify(fspromises.readFile);
  fs2.readlink = _depromisify(fspromises.readlink);
  fs2.realpath = _depromisify(fspromises.realpath);
  fs2.rename = _depromisify(fspromises.rename);
  fs2.rm = _depromisify(fspromises.rm);
  fs2.rmdir = _depromisify(fspromises.rmdir);
  fs2.stat = _depromisify(fspromises.stat);
  fs2.symlink = _depromisify(fspromises.symlink);
  fs2.unlink = _depromisify(fspromises.unlink);
  fs2.writeFile = _depromisify(fspromises.writeFile);
  fs2.Dirent = fspromises.Dirent;
  fs2.Stats = fspromises.Stats;
  function _modeNum(m, def) {
    switch (typeof m) {
      case "number":
        return m;
      case "string":
        return parseInt(m, 8);
      default:
        if (def) {
          return _modeNum(def);
        } else {
          return void 0;
        }
    }
  }
  function _fileInfoToStats(fileInfo) {
    const stats = {
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
      birthtime: new Date(fileInfo.createdTime)
    };
    return Object.assign(new fs2.Stats(), stats);
  }
  function _fileInfoToDirent(fileInfo) {
    return Object.assign(new fs2.Dirent(), {
      name: fileInfo.filename,
      isFile: () => fileInfo.isFile,
      isDirectory: () => fileInfo.isDirectory,
      isSymbolicLink: () => fileInfo.isSymlink
    });
  }
  function _ensureWriteableData(data) {
    if (typeof data === "string") {
      return;
    } else if (typeof data === "object" && data !== null) {
      if (data instanceof Uint8Array || data instanceof Buffer) {
        return;
      }
    }
    throw new Error(
      "Cannot write to the file. Written data must be a string, Buffer or Uint8Array."
    );
  }
  function _checkFlag(flags, flag) {
    return (flags & flag) === flag;
  }
  function _asUintArray(data) {
    if (data instanceof Buffer) {
      return data.valueOf();
    } else {
      return data;
    }
  }
  fs2.accessSync = (path, mode = fs2.constants.F_OK) => {
    try {
      const info = SyncFs.fileInfo(path.toString());
      if (_checkFlag(mode, fs2.constants.R_OK) && !info.canRead) {
        throw new FsError(
          "Permission denied [read]",
          "EACCES",
          path.toString()
        );
      }
      if (_checkFlag(mode, fs2.constants.W_OK) && !info.canWrite) {
        throw new FsError(
          "Permission denied [write]",
          "EACCES",
          path.toString()
        );
      }
      if (_checkFlag(mode, fs2.constants.X_OK) && !info.canExecute) {
        throw new FsError(
          "Permission denied [execute]",
          "EACCES",
          path.toString()
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
        err
      );
    }
  };
  fs2.writeFileSync = (path, data, options) => {
    _ensureWriteableData(data);
    const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return SyncFs.writeFile(path.toString(), encoded);
    }
    return SyncFs.writeFile(path.toString(), _asUintArray(data));
  };
  fs2.appendFileSync = (path, data, options) => {
    _ensureWriteableData(data);
    const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return SyncFs.appendFile(path.toString(), encoded);
    }
    return SyncFs.appendFile(path.toString(), _asUintArray(data));
  };
  fs2.readFileSync = (path, options) => {
    const encoding = typeof options === "string" ? options : options?.encoding;
    const data = SyncFs.readFile(path.toString());
    if (encoding) {
      return Buffer.from(data).toString(encoding);
    }
    return Buffer.from(data);
  };
  fs2.mkdirSync = (path) => {
    return SyncFs.makeDir(path.toString());
  };
  fs2.renameSync = (oldPath, newPath) => {
    return SyncFs.moveFile(oldPath.toString(), newPath.toString());
  };
  fs2.copyFileSync = (src, dest) => {
    return SyncFs.copyFile(src.toString(), dest.toString());
  };
  fs2.unlinkSync = (path) => {
    return SyncFs.deleteFile(path.toString(), { followSymlinks: false });
  };
  fs2.rmdirSync = (path, options) => {
    return SyncFs.deleteFile(path.toString(), {
      recursive: options?.recursive
    });
  };
  fs2.rmSync = (path, options) => {
    return SyncFs.deleteFile(path.toString(), {
      recursive: options?.recursive
    });
  };
  fs2.chmodSync = (path, mode) => {
    return SyncFs.chmod(path.toString(), _modeNum(mode, 493), {
      followSymlinks: true
    });
  };
  fs2.chownSync = (path, uid, gid) => {
    return SyncFs.chown(path.toString(), uid, gid, { followSymlinks: true });
  };
  fs2.lchmodSync = (path, mode) => {
    return SyncFs.chmod(path.toString(), _modeNum(mode, 493), {
      followSymlinks: false
    });
  };
  fs2.lchownSync = (path, uid, gid) => {
    return SyncFs.chown(path.toString(), uid, gid, { followSymlinks: false });
  };
  fs2.readdirSync = (path, options) => {
    const withFileTypes = typeof options === "object" && options != null ? options.withFileTypes ?? false : false;
    if (withFileTypes) {
      return SyncFs.listDir(path.toString()).map(_fileInfoToDirent);
    }
    return SyncFs.listFilenames(path.toString());
  };
  fs2.readlinkSync = (path, options) => {
    const info = SyncFs.fileInfo(path.toString(), { followSymlinks: false });
    if (!info.isSymlink || !info.symlinkTarget) {
      throw new Error("Not a symlink");
    }
    const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
    if (encoding === "buffer") {
      return Buffer.from(info.symlinkTarget);
    }
    return info.symlinkTarget;
  };
  fs2.statSync = (path) => {
    return _fileInfoToStats(
      SyncFs.fileInfo(path.toString(), { followSymlinks: true })
    );
  };
  fs2.lstatSync = (path) => {
    return _fileInfoToStats(
      SyncFs.fileInfo(path.toString(), { followSymlinks: false })
    );
  };
  fs2.symlinkSync = (target, path) => {
    return SyncFs.makeLink(path.toString(), target.toString());
  };
  fs2.realpathSync = (path, options) => {
    const info = SyncFs.fileInfo(path.toString(), { followSymlinks: true });
    const encoding = typeof options === "string" ? options : options?.encoding;
    if (encoding === "buffer") {
      return Buffer.from(info.filepath);
    }
    return info.filepath;
  };
  fs2.cpSync = fs2.copyFileSync;
  fs2.linkSync = fs2.symlinkSync;
})(fs || (fs = {}));
var fs_default = fs;
var constants = fs.constants;
var access = fs.access;
var appendFile = fs.appendFile;
var chmod = fs.chmod;
var chown = fs.chown;
var copyFile = fs.copyFile;
var cp = fs.cp;
var lchmod = fs.lchmod;
var lchown = fs.lchown;
var link = fs.link;
var lstat = fs.lstat;
var mkdir = fs.mkdir;
var open = fs.open;
var readdir = fs.readdir;
var readFile = fs.readFile;
var readlink = fs.readlink;
var realpath = fs.realpath;
var rename = fs.rename;
var rm = fs.rm;
var rmdir = fs.rmdir;
var stat = fs.stat;
var symlink = fs.symlink;
var unlink = fs.unlink;
var writeFile = fs.writeFile;
var Dirent = fs.Dirent;
var Stats = fs.Stats;
var accessSync = fs.accessSync;
var writeFileSync = fs.writeFileSync;
var appendFileSync = fs.appendFileSync;
var readFileSync = fs.readFileSync;
var mkdirSync = fs.mkdirSync;
var renameSync = fs.renameSync;
var copyFileSync = fs.copyFileSync;
var unlinkSync = fs.unlinkSync;
var rmdirSync = fs.rmdirSync;
var rmSync = fs.rmSync;
var chmodSync = fs.chmodSync;
var chownSync = fs.chownSync;
var lchmodSync = fs.lchmodSync;
var lchownSync = fs.lchownSync;
var readdirSync = fs.readdirSync;
var readlinkSync = fs.readlinkSync;
var statSync = fs.statSync;
var lstatSync = fs.lstatSync;
var symlinkSync = fs.symlinkSync;
var realpathSync = fs.realpathSync;
var cpSync = fs.cpSync;
var linkSync = fs.linkSync;
export {
  Dirent,
  Stats,
  access,
  accessSync,
  appendFile,
  appendFileSync,
  chmod,
  chmodSync,
  chown,
  chownSync,
  constants,
  copyFile,
  copyFileSync,
  cp,
  cpSync,
  fs_default as default,
  lchmod,
  lchmodSync,
  lchown,
  lchownSync,
  link,
  linkSync,
  lstat,
  lstatSync,
  mkdir,
  mkdirSync,
  open,
  readFile,
  readFileSync,
  readdir,
  readdirSync,
  readlink,
  readlinkSync,
  realpath,
  realpathSync,
  rename,
  renameSync,
  rm,
  rmSync,
  rmdir,
  rmdirSync,
  stat,
  statSync,
  symlink,
  symlinkSync,
  unlink,
  unlinkSync,
  writeFile,
  writeFileSync
};
