// src/polyfills/shared/fs-errors.ts
var FsError = class extends Error {
  constructor(message, code, path, cause) {
    super(message, { cause });
    this.code = code;
    this.path = path;
    this.name = "FsError";
  }
};
var ArgTypeError = class extends TypeError {
  code = "ERR_INVALID_ARG_TYPE";
  constructor(message) {
    super(message);
    this.name = "TypeError";
  }
};
export {
  ArgTypeError,
  FsError
};
