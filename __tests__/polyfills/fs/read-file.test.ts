import {
  afterAll,
  afterEach,
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

const file = GLib.get_current_dir() + "/__tests__/polyfills/fs/files/read-test";
const nonReadableFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/non-readable-file-2";
const nonExistentFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/non-existent";

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

const s =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Duis vitae augue lacinia, condimentum tellus in, scelerisque " +
  "nulla. Suspendisse potenti. Maecenas dapibus ut eros sagittis " +
  "ultrices. Fusce tincidunt nibh sed sollicitudin tincidunt. " +
  "Maecenas vehicula, justo nec bibendum suscipit, orci enim iaculis " +
  "orci, id porttitor dui mauris eget tortor. Sed elit urna, varius " +
  "sed sem eu, faucibus semper augue. Suspendisse potenti. Donec nisl " +
  "justo, venenatis id arcu ultricies, efficitur lobortis neque. " +
  "Curabitur ultrices quam posuere lacus euismod, nec efficitur risus " +
  "tincidunt. Vestibulum condimentum est vel massa mollis, nec dapibus " +
  "felis consectetur. Vestibulum ac justo ut sapien congue pellentesque.";

export default describe("fs.readFile", () => {
  beforeAll(async () => {
    await FsGjs.writeTextFile(nonReadableFile, "");
    await FsGjs.chmod(nonReadableFile, 0o000);
  });

  afterAll(async () => {
    await FsGjs.chmod(nonReadableFile, 0o644);
    await FsGjs.deleteFile(nonReadableFile);
  });
  afterEach(async () => {
    await FsGjs.writeTextFile(file, "");
  });

  describe("callbacks", () => {
    const fs = fsCallbacks;

    it("reads the file", async () => {
      await FsGjs.writeTextFile(file, s);

      const mock = await mustCall((cb) => fs.readFile(file, cb));
      expect(mock).toHaveBeenCalledWithLast(null, match.instanceOf(Buffer));

      const buf = mock.tracker.latestCall?.args[1] as Buffer;
      expect(buf.toString("utf-8")).toBe(s);
    });

    it("reads the file with encoding", async () => {
      await FsGjs.writeTextFile(file, s);

      const mock = await mustCall((cb) => fs.readFile(file, "utf-8", cb));
      expect(mock).toHaveBeenCalledWithLast(null, s);
    });

    it("throws error when reading from a non-readable file", async () => {
      const mock = await mustCall((cb) => fs.readFile(nonReadableFile, cb));
      expect(mock).toHaveBeenCalledWithLast(match.instanceOf(Error));
    });

    it("throws error when reading non-existent file", async () => {
      const mock = await mustCall((cb) => fs.readFile(nonExistentFile, cb));
      expect(mock).toHaveBeenCalledWithLast(match.instanceOf(Error));
    });

    it("throws error when callback is not provided", async () => {
      // @ts-expect-error
      expect(() => fs.readFile(nonExistentFile)).toThrowMatch(
        match.instanceOf(Error)
      );
    });
  });

  describe("sync", () => {
    const fs = fsCallbacks;

    it("reads the file", async () => {
      await FsGjs.writeTextFile(file, s);

      const buf = fs.readFileSync(file);

      expect(buf.toString("utf-8")).toBe(s);
    });

    it("reads the file with encoding", async () => {
      await FsGjs.writeTextFile(file, s);

      const str = fs.readFileSync(file, "utf-8");

      expect(str).toBe(s);
    });

    it("throws error when reading from a non-readable file", () => {
      expect(() => fs.readFileSync(nonReadableFile)).toThrowMatch(
        match.instanceOf(Error)
      );
    });

    it("throws error when reading non-existent file", () => {
      expect(() => fs.readFileSync(nonExistentFile)).toThrowMatch(
        match.instanceOf(Error)
      );
    });
  });

  describe("promises", () => {
    const fs = fsPromises;

    it("reads the file", async () => {
      await FsGjs.writeTextFile(file, s);

      const buf = await fs.readFile(file);

      expect(buf.toString("utf-8")).toBe(s);
    });

    it("reads the file with encoding", async () => {
      await FsGjs.writeTextFile(file, s);

      const str = await fs.readFile(file, "utf-8");

      expect(str).toBe(s);
    });

    it("throws error when reading from a non-readable file", async () => {
      await expect(fs.readFile(nonReadableFile)).toRejectMatch(
        match.instanceOf(Error)
      );
    });

    it("throws error when reading non-existent file", async () => {
      await expect(fs.readFile(nonExistentFile)).toRejectMatch(
        match.instanceOf(Error)
      );
    });
  });
});
