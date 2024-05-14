import type { FileInfo, IOStream, SyncIOStream } from "fs-gjs";
import Fs from "fs-gjs";
import type { Mode, PathLike } from "node:fs";
import type fspt from "node:fs/promises";
import type { FileReadOptions, FileReadResult } from "node:fs/promises";
import { ArgTypeError, FsError } from "./shared/fs-errors";

type AsFunction<T> = T extends Function ? T : () => void;

type FsFileHandle = Awaited<ReturnType<typeof fspt.open>>;

type FHMArgs<M extends keyof FsFileHandle> = Parameters<
  AsFunction<FsFileHandle[M]>
>;

namespace fspromises {
  export const constants = {
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
    COPYFILE_FICLONE_FORCE: 4,
  };

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

  function _fileInfoToStats(fileInfo: FileInfo): Stats {
    const stats: Partial<Stats> = {
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

  function _fileInfoToDirent(fileInfo: FileInfo): Dirent {
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

    throw new ArgTypeError(
      "Cannot write to the file. Written data must be a string, Buffer or Uint8Array.",
    );
  }

  function _checkFlag(flags: number, flag: number) {
    return (flags & flag) === flag;
  }

  function _isFileHandle(obj: any): obj is fspt.FileHandle {
    return obj instanceof FileHandle;
  }

  function _asUintArray(data: Buffer | Uint8Array): Uint8Array {
    if (data instanceof Buffer) {
      return data.valueOf();
    } else {
      return data;
    }
  }

  function _resolveTo<T, R>(
    data: T | Promise<T>,
    resolver: (data: T) => R,
  ): R | Promise<R> {
    if (data instanceof Promise) {
      return data.then(resolver);
    }
    return resolver(data);
  }

  export const access: typeof fspt.access = (path, mode = constants.F_OK) => {
    return Fs.fileInfo(path.toString())
      .then((info) => {
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
      })
      .catch((err) => {
        if (err instanceof FsError) {
          throw err;
        }

        throw new FsError(
          "No such file or directory.",
          "ENOENT",
          path.toString(),
          err,
        );
      });
  };

  export const writeFile: typeof fspt.writeFile = (path, data, options) => {
    _ensureWriteableData(data);

    if (_isFileHandle(path)) {
      return path.writeFile(data, options);
    }

    const encoding = (typeof options === "object" ? options?.encoding : options)
      ?? "utf8";

    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return Fs.writeFile(path.toString(), encoded);
    }

    return Fs.writeFile(path.toString(), _asUintArray(data));
  };

  export const appendFile: typeof fspt.appendFile = (path, data, options) => {
    _ensureWriteableData(data);

    if (_isFileHandle(path)) {
      return path.appendFile(data, options);
    }

    const encoding = (typeof options === "object" ? options?.encoding : options)
      ?? "utf8";

    if (typeof data === "string") {
      const encoded = Buffer.from(data, encoding).valueOf();
      return Fs.appendFile(path.toString(), encoded);
    }

    return Fs.appendFile(path.toString(), _asUintArray(data));
  };

  export const readFile: typeof fspt.readFile = (
    path,
    options,
  ): Promise<any> => {
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

  export const mkdir: typeof fspt.mkdir = (path): Promise<any> => {
    return Fs.makeDir(path.toString()).then(() => undefined);
  };

  export const rename: typeof fspt.rename = (oldPath, newPath) => {
    return Fs.moveFile(oldPath.toString(), newPath.toString());
  };

  export const copyFile: typeof fspt.copyFile = (src, dest) => {
    return Fs.copyFile(src.toString(), dest.toString());
  };

  export const unlink: typeof fspt.unlink = (path) => {
    return Fs.deleteFile(path.toString(), { followSymlinks: false });
  };

  export const rmdir: typeof fspt.rm = (path, options) => {
    return Fs.deleteFile(path.toString(), {
      recursive: options?.recursive,
    });
  };

  export const rm: typeof fspt.rm = (path, options) => {
    return Fs.deleteFile(path.toString(), {
      recursive: options?.recursive,
    });
  };

  export const chmod: typeof fspt.chmod = (path, mode) => {
    return Fs.chmod(path.toString(), _modeNum(mode, 0o755), {
      followSymlinks: true,
    });
  };

  export const chown: typeof fspt.chown = (path, uid, gid) => {
    return Fs.chown(path.toString(), uid, gid, { followSymlinks: true });
  };

  export const lchmod: typeof fspt.chmod = (path, mode) => {
    return Fs.chmod(path.toString(), _modeNum(mode, 0o755), {
      followSymlinks: false,
    });
  };

  export const lchown: typeof fspt.chown = (path, uid, gid) => {
    return Fs.chown(path.toString(), uid, gid, { followSymlinks: false });
  };

  export const readdir: typeof fspt.readdir = (path, options): Promise<any> => {
    const withFileTypes = typeof options === "object" && options != null
      ? options.withFileTypes ?? false
      : false;

    if (withFileTypes) {
      return Fs.listDir(path.toString()).then((files) =>
        files.map(_fileInfoToDirent)
      );
    }

    return Fs.listFilenames(path.toString());
  };

  export const readlink: typeof fspt.readlink = (
    path,
    options,
  ): Promise<any> => {
    return Fs.fileInfo(path.toString(), { followSymlinks: false }).then(
      (info) => {
        if (!info.isSymlink || !info.symlinkTarget) {
          throw new FsError(
            "File is not a symlink.",
            "EINVAL",
            path.toString(),
          );
        }

        const encoding =
          (typeof options === "object" ? options?.encoding : options) ?? "utf8";

        if (encoding === "buffer") {
          return Buffer.from(info.symlinkTarget);
        }

        return info.symlinkTarget;
      },
    );
  };

  export const stat: typeof fspt.stat = (path): Promise<any> => {
    return Fs.fileInfo(path.toString(), { followSymlinks: true }).then(
      _fileInfoToStats,
    );
  };

  export const lstat: typeof fspt.lstat = (path): Promise<any> => {
    return Fs.fileInfo(path.toString(), { followSymlinks: false }).then(
      _fileInfoToStats,
    );
  };

  export const symlink: typeof fspt.symlink = (target, path): Promise<any> => {
    return Fs.makeLink(path.toString(), target.toString());
  };

  export const realpath: typeof fspt.realpath = (
    path,
    options,
  ): Promise<any> => {
    return Fs.fileInfo(path.toString(), { followSymlinks: true }).then(
      (info) => {
        const encoding = typeof options === "string"
          ? options
          : options?.encoding;

        if (encoding === "buffer") {
          return Buffer.from(info.filepath);
        }

        return info.filepath;
      },
    );
  };

  export const cp = copyFile;
  export const link = symlink;

  export const open: typeof fspt.open = async (
    path: PathLike,
    flags?: string | number,
    mode?: Mode,
  ): Promise<any> => {
    const handle = new FileHandle(path.toString(), flags, mode);
    await handle._init();
    return handle;
  };

  class FileHandle {
    _permissions: number | undefined;

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

    _ioStream!: IOStream | SyncIOStream;

    constructor(
      private _filePath: string,
      flags: string | number = "r",
      mode?: Mode,
    ) {
      this._parseFlags(flags);
      this._permissions = _modeNum(mode, 0o666);
    }

    async _init() {
      await this._openStream();
    }

    private _parseFlags(flags: string | number) {
      if (typeof flags === "number") {
        if (_checkFlag(flags, constants.O_RDONLY)) {
          this._canRead = true;
          this._canWrite = false;
          this._canAppend = false;
        } else if (_checkFlag(flags, constants.O_WRONLY)) {
          this._canRead = false;
          this._canWrite = true;
          this._canAppend = false;
        } else if (_checkFlag(flags, constants.O_RDWR)) {
          this._canRead = true;
          this._canWrite = true;
          this._canAppend = true;
        }

        if (_checkFlag(flags, constants.O_APPEND)) {
          this._startFromEof = true;
        }

        if (_checkFlag(flags, constants.O_CREAT)) {
          this._mustExist = false;
          if (_checkFlag(flags, constants.O_EXCL)) {
            this._mustNotExist = false;
          }
        } else {
          this._mustExist = true;
        }

        if (_checkFlag(flags, constants.O_TRUNC)) {
          this._truncateOnOpen = true;
        }

        if (_checkFlag(flags, constants.O_DIRECTORY)) {
          this._onlyDirs = true;
        }

        if (_checkFlag(flags, constants.O_NOFOLLOW)) {
          this._failOnSymlink = true;
        }

        if (
          _checkFlag(flags, constants.O_SYNC)
          || _checkFlag(flags, constants.O_DSYNC)
        ) {
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

    private async _openStream() {
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

    private finishPending() {
      if ("finishPending" in this._ioStream) {
        return this._ioStream.finishPending();
      }
      return Promise.resolve();
    }

    async stat(): Promise<Stats> {
      return stat(this._filePath);
    }

    async chown(...[uid, gid]: FHMArgs<"chown">): Promise<void> {
      return chown(this._filePath, uid, gid);
    }

    async chmod(...[mode]: FHMArgs<"chmod">): Promise<void> {
      return chmod(this._filePath, mode);
    }

    async appendFile(...[data, options]: FHMArgs<"appendFile">): Promise<void> {
      if (!this._canAppend) {
        throw new Error("This file cannot be appended to.");
      }

      let uarr: Uint8Array;

      if (typeof data === "string") {
        const encoding =
          (typeof options === "object" ? options?.encoding : options) ?? "utf8";

        const encoded = Buffer.from(data, encoding).valueOf();

        uarr = encoded;
      } else if (data instanceof Buffer) {
        uarr = data.valueOf();
      } else {
        uarr = data;
      }

      this._ioStream.seekFromEnd(0);
      this._ioStream.write(uarr);

      return this.finishPending().then(() => undefined);
    }

    readFile(
      options?: {
        encoding?: null | undefined;
        flag?: string | number | undefined;
      } | null,
    ): Promise<Buffer>;
    readFile(
      options:
        | {
          encoding: BufferEncoding;
          flag?: string | number | undefined;
        }
        | BufferEncoding,
    ): Promise<string>;
    async readFile(
      options?:
        | {
          encoding?: BufferEncoding | null;
          flag?: string | number | undefined;
        }
        | BufferEncoding
        | null,
    ): Promise<string | Buffer> {
      if (!this._canRead) {
        throw new Error("This file cannot be read.");
      }

      const encoding =
        (typeof options === "object" ? options?.encoding : options) ?? "utf8";

      this._ioStream.seekFromStart(0);
      const br = this._ioStream.readAll();

      return _resolveTo(br, (bytesRead) => {
        if (encoding) {
          return Buffer.from(bytesRead).toString(encoding);
        }
        return Buffer.from(bytesRead);
      });
    }

    read(
      buffer: Buffer,
      offset?: number | null,
      length?: number | null,
      position?: number | null,
    ): Promise<FileReadResult<Buffer>>;
    read(options: FileReadOptions<Buffer>): Promise<FileReadResult<Buffer>>;
    async read(...args: any[]): Promise<FileReadResult<Buffer>> {
      if (!this._canRead) {
        throw new Error("This file cannot be read.");
      }

      let buffer: Buffer;
      let offset = 0;
      let length: number;
      let position: number | null | undefined;

      if (args[0] instanceof Buffer) {
        buffer = args[0];
        offset = args[1] ?? 0;
        length = args[2] ?? buffer.byteLength - offset;
        position = args[3];
      } else {
        const [options] = args as [FileReadOptions<Buffer>];

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
          buffer,
        };
      });
    }

    async writeFile(...[data, options]: FHMArgs<"writeFile">) {
      if (!this._canWrite) {
        throw new Error("This file cannot be written to.");
      }

      this._ioStream.truncate(0);

      if (typeof data === "string") {
        const encoding =
          (typeof options === "object" ? options?.encoding : options) ?? "utf8";

        const encoded = Buffer.from(data, encoding).valueOf();

        this._ioStream.write(encoded);
      } else {
        this._ioStream.write(data);
      }

      return this.finishPending().then(() => undefined);
    }

    write<TBuffer extends Uint8Array>(
      buffer: TBuffer,
      offset?: number | null,
      length?: number | null,
      position?: number | null,
    ): Promise<{
      bytesWritten: number;
      buffer: TBuffer;
    }>;
    write(
      data: string,
      position?: number | null,
      encoding?: BufferEncoding | null,
    ): Promise<{
      bytesWritten: number;
      buffer: string;
    }>;
    async write(...args: any[]): Promise<any> {
      if (!this._canWrite) {
        throw new Error("This file cannot be written to.");
      }

      if (typeof args[0] === "string") {
        const [data, position, encoding] = args as [
          string,
          number?,
          BufferEncoding?,
        ];

        const encoded = Buffer.from(data, encoding).valueOf();

        if (position != null) {
          this._ioStream.seekFromStart(position);
        }

        const bw = this._ioStream.write(encoded);

        return _resolveTo(bw, (bytesWritten) => {
          return {
            bytesWritten,
            buffer: data,
          };
        });
      } else {
        const [
          buffer,
          offset = 0,
          length = buffer.byteLength - offset!,
          position,
        ] = args as [Buffer, number?, number?, number?];

        const data = buffer.subarray(offset, offset + length);

        if (position != null) {
          this._ioStream.seekFromStart(position);
        }

        const bw = this._ioStream.write(data.valueOf());

        return _resolveTo(bw, (bytesWritten) => {
          return {
            bytesWritten,
            buffer: data,
          };
        });
      }
    }

    async close() {
      return this._ioStream.close();
    }

    async truncate(len?: number): Promise<void> {
      return this._ioStream.truncate(Math.max(0, len ?? 0));
    }

    async sync(): Promise<void> {
      return this._ioStream.flush();
    }

    async datasync(): Promise<void> {
      return this._ioStream.flush();
    }
  }

  export class Stats {
    dev!: number;
    ino!: number;
    mode!: number;
    nlink!: number;
    uid!: number;
    gid!: number;
    rdev!: number;
    size!: number;
    blksize!: number;
    blocks!: number;
    atimeMs!: number;
    mtimeMs!: number;
    ctimeMs!: number;
    birthtimeMs!: number;
    atime!: Date;
    mtime!: Date;
    ctime!: Date;
    birthtime!: Date;
    isFile(): boolean {
      throw new Error("Method not implemented.");
    }
    isDirectory(): boolean {
      throw new Error("Method not implemented.");
    }
    isBlockDevice(): boolean {
      throw new Error("Method not implemented.");
    }
    isCharacterDevice(): boolean {
      throw new Error("Method not implemented.");
    }
    isSymbolicLink(): boolean {
      throw new Error("Method not implemented.");
    }
    isFIFO(): boolean {
      throw new Error("Method not implemented.");
    }
    isSocket(): boolean {
      throw new Error("Method not implemented.");
    }
  }

  export class Dirent {
    name!: string;
    isFile(): boolean {
      throw new Error("Method not implemented.");
    }
    isDirectory(): boolean {
      throw new Error("Method not implemented.");
    }
    isBlockDevice(): boolean {
      throw new Error("Method not implemented.");
    }
    isCharacterDevice(): boolean {
      throw new Error("Method not implemented.");
    }
    isSymbolicLink(): boolean {
      throw new Error("Method not implemented.");
    }
    isFIFO(): boolean {
      throw new Error("Method not implemented.");
    }
    isSocket(): boolean {
      throw new Error("Method not implemented.");
    }
  }
}

export default fspromises;

export const constants = fspromises.constants;

export const access = fspromises.access;
export const appendFile = fspromises.appendFile;
export const chmod = fspromises.chmod;
export const chown = fspromises.chown;
export const copyFile = fspromises.copyFile;
export const cp = fspromises.cp;
export const lchmod = fspromises.lchmod;
export const lchown = fspromises.lchown;
export const link = fspromises.link;
export const lstat = fspromises.lstat;
export const mkdir = fspromises.mkdir;
export const open = fspromises.open;
export const readdir = fspromises.readdir;
export const readFile = fspromises.readFile;
export const readlink = fspromises.readlink;
export const realpath = fspromises.realpath;
export const rename = fspromises.rename;
export const rm = fspromises.rm;
export const rmdir = fspromises.rmdir;
export const stat = fspromises.stat;
export const symlink = fspromises.symlink;
export const unlink = fspromises.unlink;
export const writeFile = fspromises.writeFile;

export const Dirent = fspromises.Dirent;
export const Stats = fspromises.Stats;
