import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  match,
  Mock,
} from "@reactgjs/gest";
import { FunctionMock } from "@reactgjs/gest/dist/types/user-land/utils/function-mocks";
import FsGjs from "fs-gjs";
import GLib from "gi://GLib?version=2.0";
import fsCallbacks from "../../../src/polyfills/fs";
import fsPromises from "../../../src/polyfills/fs-promises";
import "../../utils/define-buffer";

const thisFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/access-file.test.ts";
const readOnlyFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/read-only-file";
const nonReadableFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/non-readable-file";
const nonExistentFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/non-existent";
const executableFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/executable";

const mustCall = <
  F extends (...args: any[]) => any = (err?: any, ...args: any[]) => void
>(
  run: (cb: F) => any
) => {
  return new Promise<FunctionMock<F>>((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error("Callback was not called."));
    }, 2500);

    const mock = Mock.create(((...args) => {
      //   console.debug(args);
      clearTimeout(t);
      resolve(mock);
    }) as F);

    run(mock.fn);
  });
};

export default describe("fs.access", () => {
  beforeAll(async () => {
    await FsGjs.writeTextFile(nonReadableFile, "");
    await FsGjs.chmod(nonReadableFile, 0o000);
    await FsGjs.chmod(readOnlyFile, 0o444);
  });

  afterAll(async () => {
    await FsGjs.chmod(nonReadableFile, 0o644);
    await FsGjs.deleteFile(nonReadableFile);
  });

  it("should export all flags required for fs.access", () => {
    expect(fsCallbacks.constants).toBeDefined();
    expect(fsCallbacks.constants.F_OK).toBeOfType("number");
    expect(fsCallbacks.constants.R_OK).toBeOfType("number");
    expect(fsCallbacks.constants.W_OK).toBeOfType("number");
    expect(fsCallbacks.constants.X_OK).toBeOfType("number");

    expect(fsPromises.constants).toBeDefined();
    expect(fsPromises.constants.F_OK).toBeOfType("number");
    expect(fsPromises.constants.R_OK).toBeOfType("number");
    expect(fsPromises.constants.W_OK).toBeOfType("number");
    expect(fsPromises.constants.X_OK).toBeOfType("number");
  });

  describe("callbacks", () => {
    const fs = fsCallbacks;

    it("should invoke the callback", async () => {
      const mock1 = await mustCall((cb) => fs.access(thisFile, cb));
      expect(mock1).toHaveBeenCalledWithLast(null);

      const mock2 = await mustCall((cb) =>
        fs.access(thisFile, fs.constants.R_OK, cb)
      );
      expect(mock2).toHaveBeenCalledWithLast(null);
    });

    it("should correctly report access to a read-only file", async () => {
      const mock1 = await mustCall((cb) => fs.access(readOnlyFile, cb));
      expect(mock1).toHaveBeenCalledWithLast(null);

      const mock2 = await mustCall((cb) =>
        fs.access(readOnlyFile, fs.constants.W_OK, cb)
      );
      expect(mock2).toHaveBeenCalledWithLast(match.instanceOf(Error));
    });

    it("should correctly report access to a non-readable file", async () => {
      const mock1 = await mustCall((cb) => fs.access(nonReadableFile, cb));
      expect(mock1).toHaveBeenCalledWithLast(null);

      const mock2 = await mustCall((cb) =>
        fs.access(nonReadableFile, fs.constants.R_OK, cb)
      );
      expect(mock2).toHaveBeenCalledWithLast(
        match.allOf(match.instanceOf(Error), {
          code: "EACCES",
          path: nonReadableFile,
        })
      );
    });

    it("should correctly report access to a non-existent file", async () => {
      const mock1 = await mustCall((cb) => fs.access(nonExistentFile, cb));
      expect(mock1).toHaveBeenCalledWithLast(
        match.allOf(match.instanceOf(Error), {
          code: "ENOENT",
          path: nonExistentFile,
        })
      );
    });

    it("should correctly report access to a non-executable file", async () => {
      const mock = await mustCall((cb) =>
        fs.access(thisFile, fs.constants.X_OK, cb)
      );
      expect(mock).toHaveBeenCalledWithLast(
        match.allOf(match.instanceOf(Error), {
          code: "EACCES",
          path: thisFile,
        })
      );
    });

    it("should correctly report access to an executable file", async () => {
      const mock = await mustCall((cb) =>
        fs.access(executableFile, fs.constants.X_OK, cb)
      );
      expect(mock).toHaveBeenCalledWithLast(null);
    });

    it("should throw error when a callback is not provided", async () => {
      // @ts-expect-error
      expect(() => fs.access(thisFile)).toThrowMatch(
        match.allOf(match.instanceOf(TypeError), {
          code: "ERR_INVALID_ARG_TYPE",
        })
      );

      // @ts-expect-error
      expect(() => fs.access(thisFile, fs.constants.R_OK)).toThrowMatch(
        match.allOf(match.instanceOf(TypeError), {
          code: "ERR_INVALID_ARG_TYPE",
        })
      );
    });
  });

  describe("sync", () => {
    const fs = fsCallbacks;

    it("should return a null", () => {
      const result1 = fs.accessSync(thisFile);
      expect(result1).toBe(undefined);

      const result2 = fs.accessSync(thisFile, fs.constants.R_OK);
      expect(result2).toBe(undefined);
    });

    it("should correctly report access to a read-only file", () => {
      const result1 = fs.accessSync(readOnlyFile);
      expect(result1).toBe(undefined);

      expect(() => fs.accessSync(readOnlyFile, fs.constants.W_OK)).toThrowMatch(
        match.instanceOf(Error)
      );
    });

    it("should correctly report access to a non-readable file", async () => {
      const result1 = fs.accessSync(nonReadableFile);
      expect(result1).toBe(undefined);

      expect(() =>
        fs.accessSync(nonReadableFile, fs.constants.R_OK)
      ).toThrowMatch(
        match.allOf(match.instanceOf(Error), {
          code: "EACCES",
          path: nonReadableFile,
        })
      );
    });

    it("should correctly report access to a non-existent file", () => {
      expect(() => fs.accessSync(nonExistentFile)).toThrowMatch(
        match.allOf(match.instanceOf(Error), {
          code: "ENOENT",
          path: nonExistentFile,
        })
      );
    });

    it("should correctly report access to a non-executable file", () => {
      expect(() => fs.accessSync(thisFile, fs.constants.X_OK)).toThrowMatch(
        match.instanceOf(Error)
      );
    });

    it("should correctly report access to an executable file", () => {
      const result = fs.accessSync(executableFile, fs.constants.X_OK);
      expect(result).toBe(undefined);
    });
  });

  describe("promises", () => {
    const fs = fsPromises;

    it("should return a null", async () => {
      const result1 = await fs.access(thisFile);
      expect(result1).toBe(undefined);

      const result2 = await fs.access(thisFile, fs.constants.R_OK);
      expect(result2).toBe(undefined);
    });

    it("should correctly report access to a read-only file", async () => {
      const result1 = await fs.access(readOnlyFile);
      expect(result1).toBe(undefined);

      await expect(fs.access(readOnlyFile, fs.constants.W_OK)).toRejectMatch(
        match.instanceOf(Error)
      );
    });

    it("should correctly report access to a non-readable file", async () => {
      const result1 = await fs.access(nonReadableFile);
      expect(result1).toBe(undefined);

      await expect(fs.access(nonReadableFile, fs.constants.R_OK)).toRejectMatch(
        match.allOf(match.instanceOf(Error), {
          code: "EACCES",
          path: nonReadableFile,
        })
      );
    });

    it("should correctly report access to a non-existent file", async () => {
      await expect(fs.access(nonExistentFile)).toRejectMatch(
        match.allOf(match.instanceOf(Error), {
          code: "ENOENT",
          path: nonExistentFile,
        })
      );
    });

    it("should correctly report access to a non-executable file", async () => {
      await expect(fs.access(thisFile, fs.constants.X_OK)).toRejectMatch(
        match.instanceOf(Error)
      );
    });

    it("should correctly report access to an executable file", async () => {
      const result = await fs.access(executableFile, fs.constants.X_OK);
      expect(result).toBe(undefined);
    });
  });
});
