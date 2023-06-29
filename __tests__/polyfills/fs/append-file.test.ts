import { afterEach, describe, expect, it, match, Mock } from "@reactgjs/gest";
import { FunctionMock } from "@reactgjs/gest/dist/types/user-land/utils/function-mocks";
import FsGjs from "fs-gjs";
import GLib from "gi://GLib?version=2.0";
import fsCallbacks from "../../../src/polyfills/fs";
import fsPromises from "../../../src/polyfills/fs-promises";
import "../../utils/define-buffer";

const file =
  GLib.get_current_dir() + "/__tests__/polyfills/fs/files/append-test";

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

export default describe("fs.appendFile", () => {
  afterEach(async () => {
    await FsGjs.writeTextFile(file, "");
  });

  describe("callbacks", () => {
    const fs = fsCallbacks;

    it("create a new file if it doesn't exist", async () => {
      await FsGjs.deleteFile(file);

      const mock = await mustCall((cb) => fs.appendFile(file, s, cb));
      expect(mock).toHaveBeenCalledWithLast(null);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe(s);
    });

    it("append test to a non-empty file", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      const mock = await mustCall((cb) => fs.appendFile(file, s, cb));
      expect(mock).toHaveBeenCalledWithLast(null);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });

    it("accepts a Buffer", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      const buf = Buffer.from(s, "utf8");

      const mock = await mustCall((cb) => fs.appendFile(file, buf, cb));
      expect(mock).toHaveBeenCalledWithLast(null);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });

    it("throws when callback is not provided", async () => {
      // @ts-expect-error
      expect(() => fs.appendFile(file, s)).toThrowMatch(
        match.allOf(match.instanceOf(TypeError), {
          code: "ERR_INVALID_ARG_TYPE",
        })
      );

      // @ts-expect-error
      expect(() => fs.appendFile(file, s, {})).toThrowMatch(
        match.allOf(match.instanceOf(TypeError), {
          code: "ERR_INVALID_ARG_TYPE",
        })
      );
    });
  });

  describe("sync", () => {
    const fs = fsCallbacks;

    it("should create a new file if it doesn't exist", async () => {
      await FsGjs.deleteFile(file);

      fs.appendFileSync(file, s);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe(s);
    });

    it("should append test to a non-empty file", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      fs.appendFileSync(file, s);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });

    it("accepts a Buffer", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      const buf = Buffer.from(s, "utf8");

      fs.appendFileSync(file, buf);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });
  });

  describe("promises", () => {
    const fs = fsPromises;

    it("should create a new file if it doesn't exist", async () => {
      await FsGjs.deleteFile(file);

      await fs.appendFile(file, s);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe(s);
    });

    it("should append test to a non-empty file", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      await fs.appendFile(file, s);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });

    it("accepts a Buffer", async () => {
      await FsGjs.writeTextFile(file, "This file is not empty.\n");

      const buf = Buffer.from(s, "utf8");

      await fs.appendFile(file, buf);

      const contents = await FsGjs.readTextFile(file);
      expect(contents).toBe("This file is not empty.\n" + s);
    });
  });
});
