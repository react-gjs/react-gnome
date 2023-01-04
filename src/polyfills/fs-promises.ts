import Gio from "gi://Gio";
import GLib from "gi://GLib";
import type { Dirent, Mode, PathLike, Stats } from "node:fs";
import type fspt from "node:fs/promises";

type AsFunction<T> = T extends Function ? T : () => void;

type FsFileHandle = Awaited<ReturnType<typeof fspt.open>>;

type FHMArgs<M extends keyof FsFileHandle> = Parameters<
  AsFunction<FsFileHandle[M]>
>;

namespace fspromises {
  export const constants = {
    COPYFILE_EXCL: 1,
    COPYFILE_FICLONE: 2,
    COPYFILE_FICLONE_FORCE: 4,
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    O_CREAT: 64,
    O_EXCL: 128,
    O_NOCTTY: 256,
    O_TRUNC: 512,
    O_APPEND: 1024,
    O_NONBLOCK: 2048,
    O_DSYNC: 4096,
    O_DIRECT: 16384,
    O_NOATIME: 262144,
    O_NOFOLLOW: 131072,
    O_SYNC: 1052672,
    O_DIRECTORY: 65536,
  };

  function _isIterable(obj: any): obj is Iterable<any> {
    return obj != null && typeof obj[Symbol.iterator] === "function";
  }

  function _everyOfIterable<T>(
    iterable: Iterable<any>,
    predicate: (value: any) => value is T
  ): iterable is Iterable<T> {
    for (const value of iterable) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }

  function _normalizeStringPosix(path: string, allowAboveRoot: boolean) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) code = path.charCodeAt(i);
      else if (code === 47 /*/*/) break;
      else code = 47 /*/*/;
      if (code === 47 /*/*/) {
        if (lastSlash === i - 1 || dots === 1) {
          // NOOP
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (
            res.length < 2 ||
            lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== 46 /*.*/ ||
            res.charCodeAt(res.length - 2) !== 46 /*.*/
          ) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf("/");
              if (lastSlashIndex !== res.length - 1) {
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
                }
                lastSlash = i;
                dots = 0;
                continue;
              }
            } else if (res.length === 2 || res.length === 1) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            if (res.length > 0) res += "/..";
            else res = "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) res += "/" + path.slice(lastSlash + 1, i);
          else res = path.slice(lastSlash + 1, i);
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === 46 /*.*/ && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }

  function _normalize(path: string) {
    if (path.length === 0) return ".";

    const isAbsolute = path.charCodeAt(0) === 47; /*/*/
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47; /*/*/

    // Normalize the path
    path = _normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";

    if (isAbsolute) return "/" + path;
    return path;
  }

  function _join(...args: string[]) {
    if (args.length === 0) return ".";
    let joined;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i] as string;
      if (arg.length > 0) {
        if (joined === undefined) joined = arg;
        else joined += "/" + arg;
      }
    }
    if (joined === undefined) return ".";
    return _normalize(joined);
  }

  function _async<T = void>(
    callback: (promise: { resolve(v: T): void; reject(e: any): void }) => void
  ) {
    return new Promise<T>(async (resolve, reject) => {
      try {
        await callback({ resolve, reject });
      } catch (err) {
        reject(err);
      }
    });
  }

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

  function _fileInfoToStats(fileInfo: Gio.FileInfo): Stats {
    const noop = () => {
      throw new Error("Method id not available.");
    };

    const beginningOfTime = new Date(0);

    fileInfo.get_attribute_as_string;

    const atime = fileInfo.get_attribute_uint64("time::access") * 1000;
    const mtime = fileInfo.get_attribute_uint64("time::modified") * 1000;
    const ctime = fileInfo.get_attribute_uint64("time::changed") * 1000;
    const creationtime = fileInfo.get_attribute_uint64("time::created") * 1000;

    const stats: Partial<Stats> = {
      isFile: () => fileInfo.get_file_type() === Gio.FileType.REGULAR,
      isDirectory: () => fileInfo.get_file_type() === Gio.FileType.DIRECTORY,
      isSymbolicLink: () => fileInfo.get_is_symlink(),
      isBlockDevice: noop,
      isCharacterDevice: noop,
      isFIFO: noop,
      isSocket: noop,
      dev: fileInfo.get_attribute_uint32("unix::device"),
      ino: Number(fileInfo.get_attribute_as_string("unix::inode")),
      rdev: fileInfo.get_attribute_uint32("unix::rdev"),
      blksize: fileInfo.get_attribute_uint32("unix::block-size"),
      blocks: Number(fileInfo.get_attribute_as_string("unix::blocks")),
      mode: fileInfo.get_attribute_uint32("unix::mode"),
      nlink: fileInfo.get_attribute_uint32("unix::nlink"),
      uid: fileInfo.get_attribute_uint32("unix::uid"),
      gid: fileInfo.get_attribute_uint32("unix::gid"),
      size: fileInfo.get_size(),
      atime: atime ? new Date(atime) : beginningOfTime,
      mtime: mtime ? new Date(mtime) : beginningOfTime,
      ctime: ctime ? new Date(ctime) : beginningOfTime,
      birthtime: creationtime ? new Date(creationtime) : beginningOfTime,
    };

    return stats as Stats;
  }

  function _fileInfoToDirent(fileInfo: Gio.FileInfo): Dirent {
    const noop = () => {
      throw new Error("Method id not available.");
    };

    return {
      isFile: () => fileInfo.get_file_type() === Gio.FileType.REGULAR,
      isDirectory: () => fileInfo.get_file_type() === Gio.FileType.DIRECTORY,
      isSymbolicLink: () => fileInfo.get_is_symlink(),
      isBlockDevice: noop,
      isCharacterDevice: noop,
      isFIFO: noop,
      isSocket: noop,
      name: fileInfo.get_name(),
    };
  }

  function _ensureWriteableData(data: any) {
    if (typeof data === "string") {
      return;
    } else if (typeof data === "object" && data !== null) {
      if (data instanceof Uint8Array || data instanceof Buffer) {
        return;
      }

      if (_isIterable(data)) {
        if (
          _everyOfIterable(
            data,
            (v): v is string | Uint8Array | Buffer =>
              typeof v === "string" ||
              v instanceof Uint8Array ||
              v instanceof Buffer
          )
        ) {
          return;
        }
      }
    }

    throw new Error(
      "Cannot write to the file. Written data must be a string, Buffer or Uint8Array."
    );
  }

  function _checkFlag(flags: number, flag: number) {
    return (flags & flag) === flag;
  }

  class FileHandle {
    _permissions: number | undefined;

    _canRead = false;
    _canWrite = false;
    _canAppend = false;
    _mustExist = true;
    _mustNotExist = false;
    _canCreate = true;
    _truncateOnOpen = false;
    _onlyDirs = false;
    _failOnSymlink = false;

    _fileStats: Stats | undefined;

    constructor(
      private _filePath: string,
      flags: string | number = "r",
      mode: Mode = 0o666
    ) {
      this._parseFlags(flags);
      this._permissions = _modeNum(mode, 0o666);
    }

    private _parseFlags(flags: string | number) {
      if (typeof flags === "number") {
        if (_checkFlag(flags, constants.O_RDONLY)) {
          this._canRead = true;
        } else if (_checkFlag(flags, constants.O_WRONLY)) {
          this._canWrite = true;
        } else if (_checkFlag(flags, constants.O_RDWR)) {
          this._canWrite = true;
          this._canAppend = true;
        } else if (_checkFlag(flags, constants.O_APPEND)) {
          this._canAppend = true;
        }

        if (!_checkFlag(flags, constants.O_CREAT)) {
          this._mustExist = true;
        }

        if (_checkFlag(flags, constants.O_EXCL)) {
          this._canCreate = false;
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
      } else if (typeof flags === "string") {
        switch (flags) {
          case "r":
            this._canRead = true;
            break;
          case "r+":
          case "rs+":
            this._canRead = true;
            this._canWrite = true;
            break;
          case "w":
            this._canWrite = true;
            this._mustExist = false;
            break;
          case "wx":
            this._canWrite = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          case "w+":
            this._canRead = true;
            this._canWrite = true;
            this._mustExist = false;
            break;
          case "wx+":
            this._canRead = true;
            this._canWrite = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          case "a":
            this._canAppend = true;
            this._mustExist = false;
            break;
          case "ax":
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          case "a+":
            this._canRead = true;
            this._canAppend = true;
            this._mustExist = false;
            break;
          case "ax+":
            this._canRead = true;
            this._canAppend = true;
            this._mustExist = false;
            this._mustNotExist = true;
            break;
          default:
            throw new Error(`Invalid flags: ${flags}`);
        }
      }
    }

    writeFile(...[data, options]: FHMArgs<"writeFile">): Promise<void> {}

    write<TBuffer extends Uint8Array>(
      buffer: TBuffer,
      offset?: number | null,
      length?: number | null,
      position?: number | null
    ): Promise<{
      bytesWritten: number;
      buffer: TBuffer;
    }>;
    write(
      data: string,
      position?: number | null,
      encoding?: BufferEncoding | null
    ): Promise<{
      bytesWritten: number;
      buffer: string;
    }>;
    write(...args): Promise<any> {}
  }

  export const open: typeof fspt.open = async (
    path,
    flags,
    mode
  ): Promise<FileHandle> => {
    return _async<FileHandle>(async (p) => {
      const file = Gio.File.new_for_path(path.toString());

      const handle = new FileHandle(path.toString(), flags, mode);

      handle._fileStats = await stat(path);
    });
  };

  export const stat: typeof fspt.stat = async (path): Promise<any> => {
    return _async<Stats>((p) => {
      const file = Gio.File.new_for_path(path.toString());

      file.query_info_async(
        "*",
        Gio.FileQueryInfoFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const info = file.query_info_finish(result);
            p.resolve(_fileInfoToStats(info));
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const readdir: typeof fspt.readdir = async (path, options) => {
    return _async<any[]>(async (p) => {
      const file = Gio.File.new_for_path(path.toString());

      const enumerator = await _async<Gio.FileEnumerator>((p2) => {
        file.enumerate_children_async(
          "*",
          Gio.FileQueryInfoFlags.NONE,
          GLib.PRIORITY_DEFAULT,
          null,
          (_, result) => {
            try {
              const enumerator = file.enumerate_children_finish(result);
              p2.resolve(enumerator);
            } catch (error) {
              p2.reject(error);
            }
          }
        );
      });

      const getNextBatch = () =>
        _async<Array<Gio.FileInfo>>((p3) => {
          enumerator.next_files_async(
            50, // max results
            GLib.PRIORITY_DEFAULT,
            null,
            (_, result) => {
              try {
                p3.resolve(enumerator.next_files_finish(result));
              } catch (e) {
                p3.reject(e);
              }
            }
          );
        });

      const children: Array<Gio.FileInfo> = [];

      let nextBatch: Array<Gio.FileInfo> = [];

      while ((nextBatch = await getNextBatch()).length > 0) {
        children.push(...nextBatch);
      }

      const withFileTypes =
        typeof options === "object" &&
        options !== null &&
        options.withFileTypes;

      p.resolve(
        withFileTypes
          ? children.map(_fileInfoToDirent)
          : children.map((f) => f.get_name())
      );
    });
  };

  export const lstat: typeof fspt.lstat = async (path): Promise<any> => {
    return _async<Stats>((p) => {
      const file = Gio.File.new_for_path(path.toString());

      file.query_info_async(
        "*",
        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const info = file.query_info_finish(result);
            p.resolve(_fileInfoToStats(info));
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const chmod: typeof fspt.chmod = async (path, mode) => {
    return _async((p) => {
      const file = Gio.File.new_for_path(path.toString());

      const info = new Gio.FileInfo();

      info.set_attribute_uint32("unix::mode", _modeNum(mode, 0o666)!);

      file.set_attributes_async(
        info,
        Gio.FileQueryInfoFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            file.set_attributes_finish(result);
            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const chown: typeof fspt.chown = async (path, uid, gid) => {
    return _async((p) => {
      const file = Gio.File.new_for_path(path.toString());

      const info = new Gio.FileInfo();

      info.set_attribute_uint32("unix::uid", uid);
      info.set_attribute_uint32("unix::gid", gid);

      file.set_attributes_async(
        info,
        Gio.FileQueryInfoFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            file.set_attributes_finish(result);
            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const mkdir: typeof fspt.mkdir = async (path, options) => {
    return _async((p) => {
      const file = Gio.File.new_for_path(path.toString());

      if (typeof options === "object" && options?.recursive) {
        throw new Error(
          "Recursive asynchronous directory creation is not currently supported."
        );
      }

      file.make_directory_async(
        GLib.PRIORITY_DEFAULT,
        null,
        async (_, result) => {
          try {
            if (!file.make_directory_finish(result)) {
              throw new Error(`Failed to create directory: ${path}`);
            }

            const mode = typeof options === "object" ? options?.mode : options;

            if (mode) {
              await chmod(path, mode);
            }

            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const rename: typeof fspt.rename = async (oldPath, newPath) => {
    return _async((p) => {
      const oldFile = Gio.File.new_for_path(oldPath.toString());
      const newFile = Gio.File.new_for_path(newPath.toString());

      oldFile.move_async(
        newFile,
        Gio.FileCopyFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        null,
        (_, result) => {
          try {
            if (!oldFile.move_finish(result)) {
              throw new Error(
                `Failed to rename file: ${oldPath} -> ${newPath}`
              );
            }
            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const copyFile: typeof fspt.copyFile = async (src, dest, flags) => {
    return _async((p) => {
      const srcFile = Gio.File.new_for_path(src.toString());
      const destFile = Gio.File.new_for_path(dest.toString());

      const shouldOverwrite = !flags || flags & constants.COPYFILE_EXCL;

      srcFile.copy_async(
        destFile,
        shouldOverwrite ? Gio.FileCopyFlags.OVERWRITE : Gio.FileCopyFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        null,
        null,
        (_, result) => {
          try {
            if (!srcFile.copy_finish(result)) {
              throw new Error(`Failed to copy file: ${src} -> ${dest}`);
            }
            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const cp = copyFile;

  export const unlink: typeof fspt.unlink = async (path) => {
    return _async((p) => {
      const file = Gio.File.new_for_path(path.toString());

      file.delete_async(GLib.PRIORITY_DEFAULT, null, (_, result) => {
        try {
          if (!file.delete_finish(result)) {
            throw new Error(`Failed to delete file: ${path}`);
          }
          p.resolve(undefined);
        } catch (error) {
          p.reject(error);
        }
      });
    });
  };

  export const rm: typeof fspt.rm = async (path, options) => {
    return _async(async (p) => {
      if (options?.recursive) {
        if ((await stat(path)).isDirectory()) {
          const children = await readdir(path);

          for (const child of children) {
            await rm(_join(path.toString(), child), options);
          }
        }
      }

      await unlink(path);
      p.resolve(undefined);
    });
  };

  export const writeFile: typeof fspt.writeFile = async (
    path,
    data,
    options
  ) => {
    _ensureWriteableData(data);

    const encoding =
      (typeof options === "object" ? options?.encoding : options) ?? "utf8";

    if (typeof path === "object" && path instanceof FileHandle) {
      if (
        _isIterable(data) &&
        !(data instanceof Buffer) &&
        !(data instanceof Uint8Array)
      ) {
        for await (const chunk of data) {
          if (typeof chunk === "string") {
            await path.write(chunk, null, encoding);
          } else {
            await path.write(chunk as Buffer);
          }
        }
        return;
      } else {
        if (typeof data === "string") {
          await path.write(data, null, encoding);
        } else {
          await path.write(data as any);
        }
        return;
      }
    }

    return _async((p) => {
      const file = Gio.File.new_for_path((path as PathLike).toString());

      let bytes: Uint8Array;

      if (typeof data === "string") {
        const buff = new Buffer(data, encoding);
        bytes = new Uint8Array(buff);
      } else {
        const buff = data as Buffer | Buffer[];
        bytes = Array.isArray(buff)
          ? (buff.map((b) => new Uint8Array(b)).flat() as any as Uint8Array)
          : new Uint8Array(buff);
      }

      file.replace_contents_async(
        bytes as any,
        bytes.byteLength,
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,
        null,
        (_, result) => {
          try {
            file.replace_contents_finish(result);
            p.resolve(undefined);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const appendFile: typeof fspt.appendFile = async (
    path,
    data,
    options
  ) => {
    _ensureWriteableData(data);

    if (typeof path === "object" && path instanceof FileHandle) {
      if (!path["_canAppend"]) {
        throw new Error("FileHandle cannot be appended to.");
      }

      if (
        _isIterable(data) &&
        !(data instanceof Buffer) &&
        !(data instanceof Uint8Array)
      ) {
        for await (const chunk of data) {
          await path.writeFile(chunk, options);
        }
        return;
      } else {
        await path.writeFile(data, options);
        return;
      }
    }

    return _async((p) => {
      const file = Gio.File.new_for_path((path as PathLike).toString());

      let bytes: Uint8Array;

      const encoding =
        (typeof options === "string" ? options : options?.encoding) ?? "utf8";

      if (typeof data === "string") {
        const buff = new Buffer(data, encoding);
        bytes = new Uint8Array(buff);
      } else {
        const buff = data as Buffer | Buffer[];
        bytes = Array.isArray(buff)
          ? (buff.map((b) => new Uint8Array(b)).flat() as any as Uint8Array)
          : new Uint8Array(buff);
      }

      file.append_to_async(
        Gio.FileCreateFlags.NONE,
        GLib.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const stream = file.append_to_finish(result);
            stream.write_all_async(
              bytes as any,
              GLib.PRIORITY_DEFAULT,
              null,
              (_, result) => {
                try {
                  stream.write_bytes_finish(result);
                  stream.close_async(
                    GLib.PRIORITY_DEFAULT,
                    null,
                    (_, result) => {
                      try {
                        stream.close_finish(result);
                        p.resolve(undefined);
                      } catch (error) {
                        p.reject(error);
                      }
                    }
                  );
                } catch (error) {
                  p.reject(error);
                }
              }
            );
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };

  export const readFile: typeof fspt.readFile = async (path, options) => {
    if (typeof path === "object" && path instanceof FileHandle) {
      return; //
    }

    return _async<any>((p) => {
      const encoding =
        typeof options === "string" ? options : options?.encoding;

      const file = Gio.File.new_for_path((path as PathLike).toString());

      file.load_contents_async(null, (_, result) => {
        try {
          const [success, contents] = file.load_contents_finish(result);
          if (success) {
            if (encoding) {
              const decoder = new TextDecoder(encoding);
              p.resolve(decoder.decode(contents as any));
            } else {
              p.resolve(Buffer.from(contents));
            }
          } else {
            p.reject(new Error("Could not read file."));
          }
        } catch (error) {
          p.reject(error);
        }
      });
    });
  };
}

export default fspromises;

export const appendFile = fspromises.appendFile;
export const chmod = fspromises.chmod;
export const chown = fspromises.chown;
export const constants = fspromises.constants;
export const copyFile = fspromises.copyFile;
export const cp = fspromises.cp;
export const lstat = fspromises.lstat;
export const mkdir = fspromises.mkdir;
export const open = fspromises.open;
export const readdir = fspromises.readdir;
export const readFile = fspromises.readFile;
export const rename = fspromises.rename;
export const rm = fspromises.rm;
export const stat = fspromises.stat;
export const unlink = fspromises.unlink;
export const writeFile = fspromises.writeFile;
