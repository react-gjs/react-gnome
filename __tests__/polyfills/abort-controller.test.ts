import { describe, expect, it, match } from "@reactgjs/gest";
import "../../src/polyfills/abort-controller";
import { waitUntil } from "../utils/wait-until";

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
      expect(controller.signal.reason.message).toBe("signal is aborted without reason");
    });

    it("should always throw the given reason", () => {
      const controller = new AbortController();

      controller.abort("Custom reason");

      expect(() => controller.signal.throwIfAborted()).toThrow("Custom reason");
    });

    it("emitted event should contain all required properties", () => {
      const controller = new AbortController();

      let event: Event | null = null;
      controller.signal.addEventListener("abort" as any, (ev) => {
        event = ev;
      });

      controller.abort();

      expect(event).toBeDefined();
      expect(event!.target).toBe(controller.signal);
      expect(event!.currentTarget).toBe(controller.signal);
      expect(event!.timeStamp).toEqual(0);
    });
  });

  describe("AbortSignal static", () => {
    it("abort() should return an aborted signal", () => {
      const signal = AbortSignal.abort();
      expect(signal.aborted).toBe(true);
      expect(signal.reason).toMatch(match.instanceOf(Error));

      const signal2 = AbortSignal.abort("Custom reason");
      expect(signal2.aborted).toBe(true);
      expect(signal2.reason).toBe("Custom reason");
    });

    it("timeout() should return a signal that will be aborted after the given time", async () => {
      const signal = AbortSignal.timeout(100);

      expect(signal.aborted).toBe(false);

      let event: Event | null = null;
      signal.addEventListener("abort" as any, (ev) => {
        event = ev;
      });

      await waitUntil(() => signal.aborted, 150);

      expect(signal.aborted).toBe(true);
      expect(signal.reason).toMatch(
        match.allOf(
          match.instanceOf(Error),
          { message: "signal timed out" },
        ),
      );
      expect(event).toBeDefined();
      expect(event!.target).toBe(signal);
      expect(event!.currentTarget).toBe(signal);
      expect(event!.timeStamp >= 100).toEqual(true);
    });

    it("any() should return a signal that will be aborted when any of the given signals is aborted", () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();

      // @ts-expect-error
      const signal: AbortSignal = AbortSignal.any([
        controller1.signal,
        controller2.signal,
        controller3.signal,
      ]);

      expect(signal.aborted).toBe(false);

      let event: Event | null = null;
      let callCount = 0;
      signal.addEventListener("abort", (ev) => {
        event = ev;
        callCount++;
      });

      controller2.abort({ message: "Custom reason" });

      expect(callCount).toBe(1);
      expect(signal.aborted).toBe(true);
      expect(signal.reason).toMatch(
        { message: "Custom reason" },
      );
      expect(event).toBeDefined();
      expect(event!.target).toBe(signal);
      expect(event!.currentTarget).toBe(signal);

      controller1.abort();
      controller3.abort();

      expect(callCount).toBe(1);
    });
  });
});
