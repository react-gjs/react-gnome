import { describe, expect, it } from "@reactgjs/gest";
import "../../src/polyfills/url";

export default describe("FormData", () => {
  it("should have the URL defined in global scope", () => {
    expect(URL).toBeDefined();
    expect(new URL("http://google.com")).toBeDefined();
  });

  it("should correctly handle parameters", () => {
    const url = new URL("http://google.com?foo=bar");
    expect(url.toString()).toEqual("http://google.com/?foo=bar");

    url.searchParams.append("baz", "2");
    expect(url.toString()).toEqual("http://google.com/?foo=bar&baz=2");

    url.searchParams.delete("foo");
    expect(url.toString()).toEqual("http://google.com/?baz=2");

    url.searchParams.append("baz", "3");
    expect(url.toString()).toEqual("http://google.com/?baz=2&baz=3");
  });

  it("should allow to change the port", () => {
    const url = new URL("http://google.com:8080");
    expect(url.port).toEqual("8080");
    url.port = "8081";
    expect(url.port).toEqual("8081");
    expect(url.toString()).toEqual("http://google.com:8081/");
  });

  it("should allow to change the username and password", () => {
    const url = new URL("https://google.com");
    expect(url.username).toEqual("");
    expect(url.password).toEqual("");
    url.username = "myname";
    url.password = "12345678";
    expect(url.username).toEqual("myname");
    expect(url.password).toEqual("12345678");
    expect(url.toString()).toEqual("https://myname:12345678@google.com/");
  });
});
