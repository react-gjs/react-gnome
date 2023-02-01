// gi://Gio
var Gio_default = Gio;

// gi://GLib
var GLib_default = GLib;

// src/polyfills/fs-promises.ts
var fspromises;
((fspromises2) => {
  fspromises2.constants = {
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
  function _isIterable(obj) {
    return obj != null && typeof obj[Symbol.iterator] === "function";
  }
  function _everyOfIterable(iterable, predicate) {
    for (const value of iterable) {
      if (!predicate(value)) {
        return false;
      }
    }
    return true;
  }
  function _normalizeStringPosix(path, allowAboveRoot) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) code = path.charCodeAt(i);
      else if (code === 47) break;
      else code = 47;
      if (code === 47) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (
            res.length < 2 ||
            lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== 46 ||
            res.charCodeAt(res.length - 2) !== 46
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
      } else if (code === 46 && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  function _normalize(path) {
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = _normalizeStringPosix(path, !isAbsolute);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return "/" + path;
    return path;
  }
  function _join(...args) {
    if (args.length === 0) return ".";
    let joined;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      if (arg.length > 0) {
        if (joined === void 0) joined = arg;
        else joined += "/" + arg;
      }
    }
    if (joined === void 0) return ".";
    return _normalize(joined);
  }
  function _async(callback) {
    return new Promise(async (resolve, reject) => {
      try {
        await callback({ resolve, reject });
      } catch (err) {
        reject(err);
      }
    });
  }
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
    const noop = () => {
      throw new Error("Method id not available.");
    };
    const beginningOfTime = new Date(0);
    fileInfo.get_attribute_as_string;
    const atime = fileInfo.get_attribute_uint64("time::access") * 1e3;
    const mtime = fileInfo.get_attribute_uint64("time::modified") * 1e3;
    const ctime = fileInfo.get_attribute_uint64("time::changed") * 1e3;
    const creationtime = fileInfo.get_attribute_uint64("time::created") * 1e3;
    const stats = {
      isFile: () => fileInfo.get_file_type() === Gio_default.FileType.REGULAR,
      isDirectory: () =>
        fileInfo.get_file_type() === Gio_default.FileType.DIRECTORY,
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
    return stats;
  }
  function _fileInfoToDirent(fileInfo) {
    const noop = () => {
      throw new Error("Method id not available.");
    };
    return {
      isFile: () => fileInfo.get_file_type() === Gio_default.FileType.REGULAR,
      isDirectory: () =>
        fileInfo.get_file_type() === Gio_default.FileType.DIRECTORY,
      isSymbolicLink: () => fileInfo.get_is_symlink(),
      isBlockDevice: noop,
      isCharacterDevice: noop,
      isFIFO: noop,
      isSocket: noop,
      name: fileInfo.get_name(),
    };
  }
  function _ensureWriteableData(data) {
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
            (v) =>
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
  function _checkFlag(flags, flag) {
    return (flags & flag) === flag;
  }
  class FileHandle {
    constructor(_filePath, flags = "r", mode = 438) {
      this._filePath = _filePath;
      this._parseFlags(flags);
      this._permissions = _modeNum(mode, 438);
    }
    _permissions;
    _canRead = false;
    _canWrite = false;
    _canAppend = false;
    _mustExist = true;
    _mustNotExist = false;
    _canCreate = true;
    _truncateOnOpen = false;
    _onlyDirs = false;
    _failOnSymlink = false;
    _fileStats;
    _parseFlags(flags) {
      if (typeof flags === "number") {
        if (_checkFlag(flags, fspromises2.constants.O_RDONLY)) {
          this._canRead = true;
        } else if (_checkFlag(flags, fspromises2.constants.O_WRONLY)) {
          this._canWrite = true;
        } else if (_checkFlag(flags, fspromises2.constants.O_RDWR)) {
          this._canWrite = true;
          this._canAppend = true;
        } else if (_checkFlag(flags, fspromises2.constants.O_APPEND)) {
          this._canAppend = true;
        }
        if (!_checkFlag(flags, fspromises2.constants.O_CREAT)) {
          this._mustExist = true;
        }
        if (_checkFlag(flags, fspromises2.constants.O_EXCL)) {
          this._canCreate = false;
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
    writeFile(...[data, options]) {}
    write(...args) {}
  }
  fspromises2.open = async (path, flags, mode) => {
    return _async(async (p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      const handle = new FileHandle(path.toString(), flags, mode);
      handle._fileStats = await fspromises2.stat(path);
    });
  };
  fspromises2.stat = async (path) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      file.query_info_async(
        "*",
        Gio_default.FileQueryInfoFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
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
  fspromises2.readdir = async (path, options) => {
    return _async(async (p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      const enumerator = await _async((p2) => {
        file.enumerate_children_async(
          "*",
          Gio_default.FileQueryInfoFlags.NONE,
          GLib_default.PRIORITY_DEFAULT,
          null,
          (_, result) => {
            try {
              const enumerator2 = file.enumerate_children_finish(result);
              p2.resolve(enumerator2);
            } catch (error) {
              p2.reject(error);
            }
          }
        );
      });
      const getNextBatch = () =>
        _async((p3) => {
          enumerator.next_files_async(
            50,
            GLib_default.PRIORITY_DEFAULT,
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
      const children = [];
      let nextBatch = [];
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
  fspromises2.lstat = async (path) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      file.query_info_async(
        "*",
        Gio_default.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
        GLib_default.PRIORITY_DEFAULT,
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
  fspromises2.chmod = async (path, mode) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      const info = new Gio_default.FileInfo();
      info.set_attribute_uint32("unix::mode", _modeNum(mode, 438));
      file.set_attributes_async(
        info,
        Gio_default.FileQueryInfoFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            file.set_attributes_finish(result);
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.chown = async (path, uid, gid) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      const info = new Gio_default.FileInfo();
      info.set_attribute_uint32("unix::uid", uid);
      info.set_attribute_uint32("unix::gid", gid);
      file.set_attributes_async(
        info,
        Gio_default.FileQueryInfoFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            file.set_attributes_finish(result);
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.mkdir = async (path, options) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      if (typeof options === "object" && options?.recursive) {
        throw new Error(
          "Recursive asynchronous directory creation is not currently supported."
        );
      }
      file.make_directory_async(
        GLib_default.PRIORITY_DEFAULT,
        null,
        async (_, result) => {
          try {
            if (!file.make_directory_finish(result)) {
              throw new Error(`Failed to create directory: ${path}`);
            }
            const mode = typeof options === "object" ? options?.mode : options;
            if (mode) {
              await fspromises2.chmod(path, mode);
            }
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.rename = async (oldPath, newPath) => {
    return _async((p) => {
      const oldFile = Gio_default.File.new_for_path(oldPath.toString());
      const newFile = Gio_default.File.new_for_path(newPath.toString());
      oldFile.move_async(
        newFile,
        Gio_default.FileCopyFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
        null,
        null,
        (_, result) => {
          try {
            if (!oldFile.move_finish(result)) {
              throw new Error(
                `Failed to rename file: ${oldPath} -> ${newPath}`
              );
            }
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.copyFile = async (src, dest, flags) => {
    return _async((p) => {
      const srcFile = Gio_default.File.new_for_path(src.toString());
      const destFile = Gio_default.File.new_for_path(dest.toString());
      const shouldOverwrite =
        !flags || flags & fspromises2.constants.COPYFILE_EXCL;
      srcFile.copy_async(
        destFile,
        shouldOverwrite
          ? Gio_default.FileCopyFlags.OVERWRITE
          : Gio_default.FileCopyFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
        null,
        null,
        null,
        (_, result) => {
          try {
            if (!srcFile.copy_finish(result)) {
              throw new Error(`Failed to copy file: ${src} -> ${dest}`);
            }
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.cp = fspromises2.copyFile;
  fspromises2.unlink = async (path) => {
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      file.delete_async(GLib_default.PRIORITY_DEFAULT, null, (_, result) => {
        try {
          if (!file.delete_finish(result)) {
            throw new Error(`Failed to delete file: ${path}`);
          }
          p.resolve(void 0);
        } catch (error) {
          p.reject(error);
        }
      });
    });
  };
  fspromises2.rm = async (path, options) => {
    return _async(async (p) => {
      if (options?.recursive) {
        if ((await fspromises2.stat(path)).isDirectory()) {
          const children = await fspromises2.readdir(path);
          for (const child of children) {
            await fspromises2.rm(_join(path.toString(), child), options);
          }
        }
      }
      await fspromises2.unlink(path);
      p.resolve(void 0);
    });
  };
  fspromises2.writeFile = async (path, data, options) => {
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
            await path.write(chunk);
          }
        }
        return;
      } else {
        if (typeof data === "string") {
          await path.write(data, null, encoding);
        } else {
          await path.write(data);
        }
        return;
      }
    }
    return _async((p) => {
      const file = Gio_default.File.new_for_path(path.toString());
      let bytes;
      if (typeof data === "string") {
        const buff = new Buffer(data, encoding);
        bytes = new Uint8Array(buff);
      } else {
        const buff = data;
        bytes = Array.isArray(buff)
          ? buff.map((b) => new Uint8Array(b)).flat()
          : new Uint8Array(buff);
      }
      file.replace_contents_async(
        bytes,
        bytes.byteLength,
        null,
        false,
        Gio_default.FileCreateFlags.REPLACE_DESTINATION,
        null,
        (_, result) => {
          try {
            file.replace_contents_finish(result);
            p.resolve(void 0);
          } catch (error) {
            p.reject(error);
          }
        }
      );
    });
  };
  fspromises2.appendFile = async (path, data, options) => {
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
      const file = Gio_default.File.new_for_path(path.toString());
      let bytes;
      const encoding =
        (typeof options === "string" ? options : options?.encoding) ?? "utf8";
      if (typeof data === "string") {
        const buff = new Buffer(data, encoding);
        bytes = new Uint8Array(buff);
      } else {
        const buff = data;
        bytes = Array.isArray(buff)
          ? buff.map((b) => new Uint8Array(b)).flat()
          : new Uint8Array(buff);
      }
      file.append_to_async(
        Gio_default.FileCreateFlags.NONE,
        GLib_default.PRIORITY_DEFAULT,
        null,
        (_, result) => {
          try {
            const stream = file.append_to_finish(result);
            stream.write_all_async(
              bytes,
              GLib_default.PRIORITY_DEFAULT,
              null,
              (_2, result2) => {
                try {
                  stream.write_bytes_finish(result2);
                  stream.close_async(
                    GLib_default.PRIORITY_DEFAULT,
                    null,
                    (_3, result3) => {
                      try {
                        stream.close_finish(result3);
                        p.resolve(void 0);
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
  fspromises2.readFile = async (path, options) => {
    if (typeof path === "object" && path instanceof FileHandle) {
      return;
    }
    return _async((p) => {
      const encoding =
        typeof options === "string" ? options : options?.encoding;
      const file = Gio_default.File.new_for_path(path.toString());
      file.load_contents_async(null, (_, result) => {
        try {
          const [success, contents] = file.load_contents_finish(result);
          if (success) {
            if (encoding) {
              const decoder = new TextDecoder(encoding);
              p.resolve(decoder.decode(contents));
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
})(fspromises || (fspromises = {}));
var fs_promises_default = fspromises;
var appendFile = fspromises.appendFile;
var chmod = fspromises.chmod;
var chown = fspromises.chown;
var constants = fspromises.constants;
var copyFile = fspromises.copyFile;
var cp = fspromises.cp;
var lstat = fspromises.lstat;
var mkdir = fspromises.mkdir;
var open = fspromises.open;
var readdir = fspromises.readdir;
var readFile = fspromises.readFile;
var rename = fspromises.rename;
var rm = fspromises.rm;
var stat = fspromises.stat;
var unlink = fspromises.unlink;
var writeFile = fspromises.writeFile;
export {
  appendFile,
  chmod,
  chown,
  constants,
  copyFile,
  cp,
  fs_promises_default as default,
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
