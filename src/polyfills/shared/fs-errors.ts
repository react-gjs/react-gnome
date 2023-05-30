export class FsError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    cause?: any
  ) {
    super(message, { cause });
    this.name = "FsError";
  }
}

export class ArgTypeError extends TypeError {
  code = "ERR_INVALID_ARG_TYPE";

  constructor(message: string) {
    super(message);
    this.name = "TypeError";
  }
}
