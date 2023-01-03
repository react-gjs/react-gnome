import { describe, expect, it } from "gest-globals";
import fs from "../../src/polyfills/fs-promises";

const p = (p: string) => `./__tests__/polyfills/${p}`;

export default describe("fs/promises polyfill", () => {
  describe("readdir()", () => {
    it("should correctly list all files", async () => {
      const resultStr = await fs.readdir(p("./test-dir-1"));
      const resultDirent = await fs.readdir(p("./test-dir-1"), {
        withFileTypes: true,
      });

      expect(resultStr.length).toBe(2);
      expect(resultDirent.length).toBe(2);

      expect(resultStr).toContainOnly("f1", "f2");
      expect(resultDirent).toContainOnlyMatch(
        {
          name: "f1",
        },
        {
          name: "f2",
        }
      );

      expect(resultDirent[0]?.isDirectory()).toBe(false);
      expect(resultDirent[1]?.isDirectory()).toBe(false);
    });

    it("should correctly list all dirs", async () => {});

    it("should correctly list all dirs and files", async () => {});
  });

  describe("stat()", () => {
    it("should correctly stat a file", async () => {});

    it("should correctly stat a dir", async () => {});

    it("should correctly stat a symlink", async () => {});
  });
});
