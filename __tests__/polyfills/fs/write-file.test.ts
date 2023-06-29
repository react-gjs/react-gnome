import {
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

const file =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/write-test";
const readOnlyFile =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/read-only-file";

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

export default describe("fs.writeFile", () => {
  beforeAll(async () => {
    await FsGjs.chmod(readOnlyFile, 0o444);
  });

  afterEach(async () => {
    await FsGjs.writeTextFile(file, "");
  });

  describe("callbacks", () => {
    const fs = fsCallbacks;

    it("writes text to file", async () => {
      const mock = await mustCall((cb) => fs.writeFile(file, s, cb));
      expect(mock).toHaveBeenCalledWithLast(null);

      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("accepts buffer", async () => {
      const mock = await mustCall((cb) =>
        fs.writeFile(file, Buffer.from(s), cb)
      );
      expect(mock).toHaveBeenCalledWithLast(null);

      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("throws when writing to a read-only file", async () => {
      const mock = await mustCall((cb) => fs.writeFile(readOnlyFile, s, cb));
      expect(mock).toHaveBeenCalledWithLast(
        match.allOf(match.instanceOf(Error))
      );
    });

    it("throws when callback is not provided", async () => {
      // @ts-expect-error
      expect(() => fs.writeFile(file, s)).toThrowMatch(
        match.allOf(match.instanceOf(Error))
      );

      // @ts-expect-error
      expect(() => fs.writeFile(file, s, {})).toThrowMatch(
        match.allOf(match.instanceOf(Error))
      );
    });
  });

  describe("sync", () => {
    const fs = fsCallbacks;

    it("writes text to file", async () => {
      fs.writeFileSync(file, s);
      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("accepts buffer", async () => {
      fs.writeFileSync(file, Buffer.from(s));
      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("throws when writing to a read-only file", async () => {
      expect(() => fs.writeFileSync(readOnlyFile, s)).toThrowMatch(
        match.allOf(match.instanceOf(Error))
      );
    });
  });

  describe("promises", () => {
    const fs = fsPromises;

    it("writes text to file", async () => {
      await fs.writeFile(file, s);
      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("accepts buffer", async () => {
      await fs.writeFile(file, Buffer.from(s));
      const content = await FsGjs.readTextFile(file);
      expect(content).toBe(s);
    });

    it("throws when writing to a read-only file", async () => {
      await expect(fs.writeFile(readOnlyFile, s)).toRejectMatch(
        match.allOf(match.instanceOf(Error))
      );
    });
  });
});
