import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  match,
} from "@reactgjs/gest";
import { WebSocket } from "../../../src/polyfills/websocket";
import { createFunction } from "../../utils/tracked-function";
import { waitUntil } from "../../utils/wait-until";

const ECHO_SERVER = "wss://ws.postman-echo.com/raw";

export default describe("WebSocket", () => {
  describe("positive scenarios", () => {
    let socket: InstanceType<typeof WebSocket>;

    beforeEach(() => {
      socket = new WebSocket(ECHO_SERVER);
      socket.onerror = (e) => {
        console.error(e);
      };
    });

    afterEach(() => {
      if (socket.readyState === socket.OPEN) {
        socket.close();
      }
    });

    it("should echo back text messages via onmessage method", async () => {
      const openHandler = createFunction(() => {});
      const messageHandler = createFunction(() => {});

      socket.onopen = openHandler;
      socket.onmessage = messageHandler;

      await waitUntil(() => socket.readyState === socket.OPEN);

      expect(openHandler.calls.length).toBe(1);

      socket.send("Hello World! 123");

      await waitUntil(() => messageHandler.calls.length === 1);

      expect(messageHandler.calls[0]).toMatch({
        args: [{ data: "Hello World! 123" }],
        error: undefined,
      });
    });

    it("should echo back text messages via message event", async () => {
      const openHandler = createFunction(() => {});
      const messageHandler = createFunction(() => {});

      // @ts-expect-error
      socket.addEventListener("open", openHandler);
      // @ts-expect-error
      socket.addEventListener("message", messageHandler);

      await waitUntil(() => socket.readyState === socket.OPEN);

      expect(openHandler.calls.length).toBe(1);

      socket.send("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");

      await waitUntil(() => messageHandler.calls.length === 1);

      expect(messageHandler.calls[0]).toMatch({
        args: [
          { data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        ],
        error: undefined,
      });
    });
  });

  describe("negative scenarios", () => {
    it("should emit an error if the server is not available", async () => {
      const socket = new WebSocket("ws://localhost:12345");
      const errorHandler = createFunction(() => {});

      socket.onerror = errorHandler;

      await waitUntil(() => errorHandler.calls.length === 1);

      expect(errorHandler.calls[0]).toMatch({
        args: [
          {
            error: match.instanceOf(Error),
            // {
            //   statusCode: 4,
            //   statusMessage: "Could not connect: Connection refused",
            //   err: {},
            // },
          },
        ],
      });
    });
  });
});
