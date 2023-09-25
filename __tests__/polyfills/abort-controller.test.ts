import { describe, expect, it, match } from "@reactgjs/gest";
import "../../src/polyfills/abort-controller";

export default describe("AbortController", () => {
  it("should be defined", () => {
    expect(AbortController).toBeDefined();
  });

  it("should be constructable", () => {
    expect(new AbortController()).toBeDefined();
  });

  it("should have a signal property", () => {
    const controller = new AbortController();
    expect(controller.signal).toBeDefined();
  });

  it("signal should be an instance of AbortSignal", () => {
    const controller = new AbortController();
    expect(controller.signal).toMatch(match.instanceOf(AbortSignal));
  });

  it("should correctly set the aborted property", () => {
    const controller = new AbortController();
    expect(controller.signal.aborted).toBe(false);
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });

  describe(".signal", () => {
    it("should correctly send an abort signal (using the onabort callback)", () => {
      const controller = new AbortController();

      let isAborted = false;
      controller.signal.onabort = () => {
        isAborted = true;
      };

      controller.abort();

      expect(isAborted).toBe(true);
    });

    it("should correctly send an abort signal (using the addEventListener method)", () => {
      const controller = new AbortController();

      let isAborted = false;
      controller.signal.addEventListener("abort" as any, () => {
        isAborted = true;
      });

      controller.abort();

      expect(isAborted).toBe(true);
    });

    it("should correctly send an abort signal (using both the onabort callback and the addEventListener method)", () => {
      const controller = new AbortController();

      let isAborted1 = false;
      controller.signal.onabort = () => {
        isAborted1 = true;
      };

      let isAborted2 = false;
      controller.signal.addEventListener("abort" as any, () => {
        isAborted2 = true;
      });

      controller.abort();

      expect(isAborted1).toBe(true);
      expect(isAborted2).toBe(true);
    });

    it("should correctly remove the registered listeners", () => {
      const controller = new AbortController();

      let isAborted = false;
      const listener1 = () => {
        isAborted = true;
      };

      controller.signal.addEventListener("abort" as any, listener1);
      controller.signal.removeEventListener("abort" as any, listener1);

      controller.abort();

      expect(isAborted).toBe(false);
    });

    it("should correctly set the reason", () => {
      const controller = new AbortController();

      controller.abort();

      expect(controller.signal.reason).toMatch(match.instanceOf(Error));
      expect(controller.signal.reason.message).toBe("Signal was aborted.");
    });
  });
});
