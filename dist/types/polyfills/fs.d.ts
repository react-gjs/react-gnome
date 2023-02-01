declare namespace fs {
  const appendFile: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const chmod: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const chown: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const constants: {
    COPYFILE_EXCL: number;
    COPYFILE_FICLONE: number;
    COPYFILE_FICLONE_FORCE: number;
    O_RDONLY: number;
    O_WRONLY: number;
    O_RDWR: number;
    O_CREAT: number;
    O_EXCL: number;
    O_NOCTTY: number;
    O_TRUNC: number;
    O_APPEND: number;
    O_NONBLOCK: number;
    O_DSYNC: number;
    O_DIRECT: number;
    O_NOATIME: number;
    O_NOFOLLOW: number;
    O_SYNC: number;
    O_DIRECTORY: number;
  };
  const copyFile: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const cp: (...args: [...any[], (err: any, result?: unknown) => void]) => void;
  const lstat: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const mkdir: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const open: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const readdir: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const readFile: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const rename: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const rm: (...args: [...any[], (err: any, result?: unknown) => void]) => void;
  const stat: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const unlink: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
  const writeFile: (
    ...args: [...any[], (err: any, result?: unknown) => void]
  ) => void;
}
export default fs;
export declare const appendFile: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const chmod: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const chown: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const constants: {
  COPYFILE_EXCL: number;
  COPYFILE_FICLONE: number;
  COPYFILE_FICLONE_FORCE: number;
  O_RDONLY: number;
  O_WRONLY: number;
  O_RDWR: number;
  O_CREAT: number;
  O_EXCL: number;
  O_NOCTTY: number;
  O_TRUNC: number;
  O_APPEND: number;
  O_NONBLOCK: number;
  O_DSYNC: number;
  O_DIRECT: number;
  O_NOATIME: number;
  O_NOFOLLOW: number;
  O_SYNC: number;
  O_DIRECTORY: number;
};
export declare const copyFile: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const cp: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const lstat: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const mkdir: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const open: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const readdir: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const readFile: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const rename: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const rm: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const stat: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const unlink: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
export declare const writeFile: (
  ...args: [...any[], (err: any, result?: unknown) => void]
) => void;
