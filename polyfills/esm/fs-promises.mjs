// src/polyfills/fs-promises.ts
import Fs from "fs-gjs";
import { ArgTypeError, FsError } from "./shared/fs-errors.mjs";
var fspromises;
((fspromises2) => {
  fspromises2.constants = {
    UV_FS_SYMLINK_DIR: 1,
    UV_FS_SYMLINK_JUNCTION: 2,
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    UV_DIRENT_UNKNOWN: 0,
    UV_DIRENT_FILE: 1,
    UV_DIRENT_DIR: 2,
    UV_DIRENT_LINK: 3,
    UV_DIRENT_FIFO: 4,
    UV_DIRENT_SOCKET: 5,
    UV_DIRENT_CHAR: 6,
    UV_DIRENT_BLOCK: 7,
    S_IFMT: 61440,
    S_IFREG: 32768,
    S_IFDIR: 16384,
    S_IFCHR: 8192,
    S_IFBLK: 24576,
    S_IFIFO: 4096,
    S_IFLNK: 40960,
    S_IFSOCK: 49152,
    O_CREAT: 64,
    O_EXCL: 128,
    UV_FS_O_FILEMAP: 0,
    O_NOCTTY: 256,
    O_TRUNC: 512,
    O_APPEND: 1024,
    O_DIRECTORY: 65536,
    O_NOATIME: 262144,
    O_NOFOLLOW: 131072,
    O_SYNC: 1052672,
    O_DSYNC: 4096,
    O_DIRECT: 16384,
    O_NONBLOCK: 2048,
    S_IRWXU: 448,
    S_IRUSR: 256,
    S_IWUSR: 128,
    S_IXUSR: 64,
    S_IRWXG: 56,
    S_IRGRP: 32,
    S_IWGRP: 16,
    S_IXGRP: 8,
    S_IRWXO: 7,
    S_IROTH: 4,
    S_IWOTH: 2,
    S_IXOTH: 1,
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
    UV_FS_COPYFILE_EXCL: 1,
    COPYFILE_EXCL: 1,
    UV_FS_COPYFILE_FICLONE: 2,
    COPYFILE_FICLONE: 2,
    UV_FS_COPYFILE_FICLONE_FORCE: 4,
    COPYFILE_FICLONE_FORCE: 4
  };
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
    return Object.assign(new Stats2(), stats);
  }
  function _fileInfoToDirent(fileInfo) {
    return Object.assign(new Dirent2(), {
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
    throw new ArgTypeError(
      "Cannot write to the file. Written data must be a string, Buffer or Uint8Array."
    );
  }
  function _checkFlag(flags, flag) {
    return (flags & flag) === flag;
  }
  function _isFileHandle(obj) {
    return obj instanceof FileHandle;
  }
  function _asUintArray(data) {
    if (data instanceof Buffer) {
      return data.valueOf();
    } else {
      return data;
    }
  }
  function _resolveTo(data, resolver) {
    if (data instanceof Promise) {
      return data.then(resolver);
    }
    return resolver(data);
  }
  fspromises2.access = (path, mode = fspromises2.constants.F_OK) => {
    return Fs.fileInfo(path.toString()).then((info) => {
      if (_checkFlag(mode, fspromises2.constants.R_OK) && !info.canRead) {
        throw new FsError(
          "Permission denied [read]",
          "EACCES",
          path.toString()
        );
      }
      if (_checkFlag(mode, fspromises2.constants.W_OK) && !info.canWrite) {
        throw new FsError(
          "Permission denied [write]",
          "EACCES",
          path.toString()
        );
      }
      if (_checkFlag(mode, fspromises2.constants.X_OK) && !info.canExecute) {
        throw new FsError(
          "Permission denied [execute]",
          "EACCES",
          path.toString()
        );
      }
    }).catch((err) => {
      if (err instanceof FsError) {
        throw err;
      }
      throw new FsError(
        "No such file or directory.",
        "ENOENT",
        path.toString(),
        err
      );
    });
  };
  fspromises2.writeFile = (path, data, options) => {
    _ensureWriteableData(data);
    if (_isFileHandle(path)) {
      return path.writeFile(data, options);
    }
    const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return Fs.writeFile(path.toString(), encoded);
    }
    return Fs.writeFile(path.toString(), _asUintArray(data));
  };
  fspromises2.appendFile = (path, data, options) => {
    _ensureWriteableData(data);
    if (_isFileHandle(path)) {
      return path.appendFile(data, options);
    }
    const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return Fs.appendFile(path.toString(), encoded);
    }
    return Fs.appendFile(path.toString(), _asUintArray(data));
  };
  fspromises2.readFile = (path, options) => {
    if (_isFileHandle(path)) {
      return path.readFile(options);
    }
    const encoding = typeof options === "string" ? options : options?.encoding;
    return Fs.readFile(path.toString()).then((data) => {
      if (encoding) {
        return Buffer.from(data).toString(encoding);
      }
      return Buffer.from(data);
    });
  };
  fspromises2.mkdir = (path) => {
    return Fs.makeDir(path.toString()).then(() => void 0);
  };
  fspromises2.rename = (oldPath, newPath) => {
    return Fs.moveFile(oldPath.toString(), newPath.toString());
  };
  fspromises2.copyFile = (src, dest) => {
    return Fs.copyFile(src.toString(), dest.toString());
  };
  fspromises2.unlink = (path) => {
    return Fs.deleteFile(path.toString(), { followSymlinks: false });
  };
  fspromises2.rmdir = (path, options) => {
    return Fs.deleteFile(path.toString(), {
      recursive: options?.recursive
    });
  };
  fspromises2.rm = (path, options) => {
    return Fs.deleteFile(path.toString(), {
      recursive: options?.recursive
    });
  };
  fspromises2.chmod = (path, mode) => {
    return Fs.chmod(path.toString(), _modeNum(mode, 493), {
      followSymlinks: true
    });
  };
  fspromises2.chown = (path, uid, gid) => {
    return Fs.chown(path.toString(), uid, gid, { followSymlinks: true });
  };
  fspromises2.lchmod = (path, mode) => {
    return Fs.chmod(path.toString(), _modeNum(mode, 493), {
      followSymlinks: false
    });
  };
  fspromises2.lchown = (path, uid, gid) => {
    return Fs.chown(path.toString(), uid, gid, { followSymlinks: false });
  };
  fspromises2.readdir = (path, options) => {
    const withFileTypes = typeof options === "object" && options != null ? options.withFileTypes ?? false : false;
    if (withFileTypes) {
      return Fs.listDir(path.toString()).then(
        (files) => files.map(_fileInfoToDirent)
      );
    }
    return Fs.listFilenames(path.toString());
  };
  fspromises2.readlink = (path, options) => {
    return Fs.fileInfo(path.toString(), { followSymlinks: false }).then(
      (info) => {
        if (!info.isSymlink || !info.symlinkTarget) {
          throw new FsError(
            "File is not a symlink.",
            "EINVAL",
            path.toString()
          );
        }
        const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
        if (encoding === "buffer") {
          return Buffer.from(info.symlinkTarget);
        }
        return info.symlinkTarget;
      }
    );
  };
  fspromises2.stat = (path) => {
    return Fs.fileInfo(path.toString(), { followSymlinks: true }).then(
      _fileInfoToStats
    );
  };
  fspromises2.lstat = (path) => {
    return Fs.fileInfo(path.toString(), { followSymlinks: false }).then(
      _fileInfoToStats
    );
  };
  fspromises2.symlink = (target, path) => {
    return Fs.makeLink(path.toString(), target.toString());
  };
  fspromises2.realpath = (path, options) => {
    return Fs.fileInfo(path.toString(), { followSymlinks: true }).then(
      (info) => {
        const encoding = typeof options === "string" ? options : options?.encoding;
        if (encoding === "buffer") {
          return Buffer.from(info.filepath);
        }
        return info.filepath;
      }
    );
  };
  fspromises2.cp = fspromises2.copyFile;
  fspromises2.link = fspromises2.symlink;
  fspromises2.open = async (path, flags, mode) => {
    const handle = new FileHandle(path.toString(), flags, mode);
    await handle._init();
    return handle;
  };
  class FileHandle {
    constructor(_filePath, flags = "r", mode) {
      this._filePath = _filePath;
      this._parseFlags(flags);
      this._permissions = _modeNum(mode, 438);
    }
    _permissions;
    _canRead = false;
    _canWrite = false;
    _canAppend = false;
    _mustExist = false;
    _mustNotExist = false;
    _truncateOnOpen = false;
    _onlyDirs = false;
    _failOnSymlink = false;
    _startFromEof = false;
    _openInSyncMode = false;
    _ioStream;
    async _init() {
      await this._openStream();
    }
    _parseFlags(flags) {
      if (typeof flags === "number") {
        if (_checkFlag(flags, fspromises2.constants.O_RDONLY)) {
          this._canRead = true;
          this._canWrite = false;
          this._canAppend = false;
        } else if (_checkFlag(flags, fspromises2.constants.O_WRONLY)) {
          this._canRead = false;
          this._canWrite = true;
          this._canAppend = false;
        } else if (_checkFlag(flags, fspromises2.constants.O_RDWR)) {
          this._canRead = true;
          this._canWrite = true;
          this._canAppend = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_APPEND)) {
          this._startFromEof = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_CREAT)) {
          this._mustExist = false;
          if (_checkFlag(flags, fspromises2.constants.O_EXCL)) {
            this._mustNotExist = false;
          }
        } else {
          this._mustExist = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_TRUNC)) {
          this._truncateOnOpen = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_DIRECTORY)) {
          this._onlyDirs = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_NOFOLLOW)) {
          this._failOnSymlink = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_SYNC) || _checkFlag(flags, fspromises2.constants.O_DSYNC)) {
          this._openInSyncMode = true;
        }
      } else if (typeof flags === "string") {
        switch (flags) {
          case "a":
            this._canRead = false;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = false;
            break;
          case "ax":
            this._canRead = false;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          case "a+":
            this._canRead = true;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = false;
            break;
          case "ax+":
            this._canRead = true;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          case "as":
            this._canRead = false;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = false;
            this._openInSyncMode = true;
            break;
          case "as+":
            this._canRead = true;
            this._canWrite = false;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = false;
            this._openInSyncMode = true;
            break;
          case "r":
            this._canRead = true;
            this._canWrite = false;
            this._canAppend = false;
            this._mustExist = true;
            this._mustNotExist = false;
            break;
          case "r+":
            this._canRead = true;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = true;
            this._mustNotExist = false;
            break;
          case "rs+":
            this._canRead = true;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = true;
            this._mustNotExist = false;
            this._openInSyncMode = true;
            break;
          case "w":
            this._canRead = false;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = false;
            this._mustNotExist = false;
            this._truncateOnOpen = true;
            break;
          case "wx":
            this._canRead = false;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = false;
            this._mustNotExist = true;
            this._truncateOnOpen = true;
            break;
          case "w+":
            this._canRead = true;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = false;
            this._mustNotExist = false;
            this._truncateOnOpen = true;
            break;
          case "wx+":
            this._canRead = true;
            this._canWrite = true;
            this._canAppend = false;
            this._mustExist = false;
            this._mustNotExist = true;
            this._truncateOnOpen = true;
            break;
          default:
            throw new Error(`Invalid flags: ${flags}`);
        }
      }
    }
    async _openStream() {
      const fileExists = Fs.sync.fileExists(this._filePath);
      if (this._mustExist && !fileExists) {
        throw new Error(`File does not exist: ${this._filePath}`);
      }
      if (this._mustNotExist && fileExists) {
        throw new Error(`File already exists: ${this._filePath}`);
      }
      if (fileExists) {
        if (this._openInSyncMode) {
          this._ioStream = await Fs.sync.openIOStream(this._filePath, "OPEN");
        } else {
          this._ioStream = await Fs.openIOStream(this._filePath, "OPEN");
        }
      } else {
        if (this._openInSyncMode) {
          this._ioStream = await Fs.sync.openIOStream(this._filePath, "CREATE");
        } else {
          this._ioStream = await Fs.openIOStream(this._filePath, "CREATE");
        }
      }
      if (this._canWrite && this._truncateOnOpen) {
        this._ioStream.truncate(0);
      }
      if (this._startFromEof) {
        this._ioStream.seekFromEnd(0);
      }
    }
    finishPending() {
      if ("finishPending" in this._ioStream) {
        return this._ioStream.finishPending();
      }
      return {
        then(fn) {
          fn();
        }
      };
    }
    async stat() {
      return (0, fspromises2.stat)(this._filePath);
    }
    async chown(...[uid, gid]) {
      return (0, fspromises2.chown)(this._filePath, uid, gid);
    }
    async chmod(...[mode]) {
      return (0, fspromises2.chmod)(this._filePath, mode);
    }
    async appendFile(...[data, options]) {
      if (!this._canAppend) {
        throw new Error("This file cannot be appended to.");
      }
      let uarr;
      if (typeof data === "string") {
        const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
        const encoded = Buffer.from(data, encoding).valueOf();
        uarr = encoded;
      } else if (data instanceof Buffer) {
        uarr = data.valueOf();
      } else {
        uarr = data;
      }
      this._ioStream.seekFromEnd(0);
      this._ioStream.write(uarr);
      return this.finishPending().then(() => void 0);
    }
    async readFile(options) {
      if (!this._canRead) {
        throw new Error("This file cannot be read.");
      }
      const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
      this._ioStream.seekFromStart(0);
      const br = this._ioStream.readAll();
      return _resolveTo(br, (bytesRead) => {
        if (encoding) {
          return Buffer.from(bytesRead).toString(encoding);
        }
        return Buffer.from(bytesRead);
      });
    }
    async read(...args) {
      if (!this._canRead) {
        throw new Error("This file cannot be read.");
      }
      let buffer;
      let offset = 0;
      let length;
      let position;
      if (args[0] instanceof Buffer) {
        buffer = args[0];
        offset = args[1] ?? 0;
        length = args[2] ?? buffer.byteLength - offset;
        position = args[3];
      } else {
        const [options] = args;
        buffer = options.buffer ?? Buffer.alloc(0);
        offset = options.offset ?? 0;
        length = options.length ?? buffer.byteLength - offset;
        position = options.position;
      }
      if (position != null) {
        this._ioStream.seekFromStart(position);
      }
      const br = this._ioStream.read(length);
      return _resolveTo(br, (bytesRead) => {
        buffer.set(bytesRead, offset);
        return {
          bytesRead: bytesRead.length,
          buffer
        };
      });
    }
    async writeFile(...[data, options]) {
      if (!this._canWrite) {
        throw new Error("This file cannot be written to.");
      }
      this._ioStream.truncate(0);
      if (typeof data === "string") {
        const encoding = (typeof options === "object" ? options?.encoding : options) ?? "utf8";
        const encoded = Buffer.from(data, encoding).valueOf();
        this._ioStream.write(encoded);
      } else {
        this._ioStream.write(data);
      }
      return this.finishPending().then(() => void 0);
    }
    async write(...args) {
      if (!this._canWrite) {
        throw new Error("This file cannot be written to.");
      }
      if (typeof args[0] === "string") {
        const [data, position, encoding] = args;
        const encoded = Buffer.from(data, encoding).valueOf();
        if (position != null) {
          this._ioStream.seekFromStart(position);
        }
        const bw = this._ioStream.write(encoded);
        return _resolveTo(bw, (bytesWritten) => {
          return {
            bytesWritten,
            buffer: data
          };
        });
      } else {
        const [
          buffer,
          offset = 0,
          length = buffer.byteLength - offset,
          position
        ] = args;
        const data = buffer.subarray(offset, offset + length);
        if (position != null) {
          this._ioStream.seekFromStart(position);
        }
        const bw = this._ioStream.write(data.valueOf());
        return _resolveTo(bw, (bytesWritten) => {
          return {
            bytesWritten,
            buffer: data
          };
        });
      }
    }
    async close() {
      return this._ioStream.close();
    }
    async truncate(len) {
      return this._ioStream.truncate(Math.max(0, len ?? 0));
    }
    async sync() {
      return this._ioStream.flush();
    }
    async datasync() {
      return this._ioStream.flush();
    }
  }
  class Stats2 {
    dev;
    ino;
    mode;
    nlink;
    uid;
    gid;
    rdev;
    size;
    blksize;
    blocks;
    atimeMs;
    mtimeMs;
    ctimeMs;
    birthtimeMs;
    atime;
    mtime;
    ctime;
    birthtime;
    isFile() {
      throw new Error("Method not implemented.");
    }
    isDirectory() {
      throw new Error("Method not implemented.");
    }
    isBlockDevice() {
      throw new Error("Method not implemented.");
    }
    isCharacterDevice() {
      throw new Error("Method not implemented.");
    }
    isSymbolicLink() {
      throw new Error("Method not implemented.");
    }
    isFIFO() {
      throw new Error("Method not implemented.");
    }
    isSocket() {
      throw new Error("Method not implemented.");
    }
  }
  fspromises2.Stats = Stats2;
  class Dirent2 {
    name;
    isFile() {
      throw new Error("Method not implemented.");
    }
    isDirectory() {
      throw new Error("Method not implemented.");
    }
    isBlockDevice() {
      throw new Error("Method not implemented.");
    }
    isCharacterDevice() {
      throw new Error("Method not implemented.");
    }
    isSymbolicLink() {
      throw new Error("Method not implemented.");
    }
    isFIFO() {
      throw new Error("Method not implemented.");
    }
    isSocket() {
      throw new Error("Method not implemented.");
    }
  }
  fspromises2.Dirent = Dirent2;
})(fspromises || (fspromises = {}));
var fs_promises_default = fspromises;
var constants = fspromises.constants;
var access = fspromises.access;
var appendFile = fspromises.appendFile;
var chmod = fspromises.chmod;
var chown = fspromises.chown;
var copyFile = fspromises.copyFile;
var cp = fspromises.cp;
var lchmod = fspromises.lchmod;
var lchown = fspromises.lchown;
var link = fspromises.link;
var lstat = fspromises.lstat;
var mkdir = fspromises.mkdir;
var open = fspromises.open;
var readdir = fspromises.readdir;
var readFile = fspromises.readFile;
var readlink = fspromises.readlink;
var realpath = fspromises.realpath;
var rename = fspromises.rename;
var rm = fspromises.rm;
var rmdir = fspromises.rmdir;
var stat = fspromises.stat;
var symlink = fspromises.symlink;
var unlink = fspromises.unlink;
var writeFile = fspromises.writeFile;
var Dirent = fspromises.Dirent;
var Stats = fspromises.Stats;
export {
  Dirent,
  Stats,
  access,
  appendFile,
  chmod,
  chown,
  constants,
  copyFile,
  cp,
  fs_promises_default as default,
  lchmod,
  lchown,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  symlink,
  unlink,
  writeFile
};
