import { describe, expect, it } from "@reactgjs/gest";
import { FormData } from "../../src/polyfills/form-data";

export default describe("FormData", () => {
  it("should be defined", () => {
    expect(FormData).toBeDefined();
  });

  it("should be constructable", () => {
    expect(new FormData()).toBeDefined();
  });

  it("should have a set method", () => {
    const formData = new FormData();
    expect(formData.set).toBeDefined();
  });

  it("should have a get method", () => {
    const formData = new FormData();
    expect(formData.get).toBeDefined();
  });

  it("should have a getAll method", () => {
    const formData = new FormData();
    expect(formData.getAll).toBeDefined();
  });

  it("should have a has method", () => {
    const formData = new FormData();
    expect(formData.has).toBeDefined();
  });

  it("should have a delete method", () => {
    const formData = new FormData();
    expect(formData.delete).toBeDefined();
  });

  it("should have a append method", () => {
    const formData = new FormData();
    expect(formData.append).toBeDefined();
  });

  describe(".set()", () => {
    it("should correctly set a value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.get("foo")).toBe("bar");
    });

    it("should correctly overwrite a value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.get("foo")).toBe("bar");
      formData.set("foo", "baz");
      expect(formData.get("foo")).toBe("baz");
    });
  });

  describe(".append()", () => {
    it("should correctly append a value", () => {
      const formData = new FormData();
      formData.append("foo", "bar");
      expect(formData.get("foo")).toBe("bar");
      formData.append("foo", "baz");
      expect(formData.get("foo")).toBe("bar");
      expect(formData.getAll("foo")).toEqual(["bar", "baz"]);
    });
  });

  describe(".delete()", () => {
    it("should correctly delete a single value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.get("foo")).toBe("bar");
      formData.delete("foo");
      expect(formData.get("foo")).toBe(null);
    });

    it("should correctly delete an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      expect(formData.getAll("foo")).toEqual(["baz", "bar"]);
      formData.delete("foo");
      expect(formData.get("foo")).toBe(null);
    });
  });

  describe(".get()", () => {
    it("should correctly get a single value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.get("foo")).toBe("bar");
    });

    it("should correctly get the first value from an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      expect(formData.get("foo")).toEqual("baz");
    });
  });

  describe(".getAll()", () => {
    it("should correctly get a single value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.getAll("foo")).toEqual(["bar"]);
    });

    it("should correctly get an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      expect(formData.getAll("foo")).toEqual(["baz", "bar"]);
    });
  });

  describe(".has()", () => {
    it("should correctly return true for a single value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect(formData.has("foo")).toBe(true);
    });

    it("should correctly return true for an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      expect(formData.has("foo")).toBe(true);
    });

    it("should correctly return false for no values", () => {
      const formData = new FormData();
      expect(formData.has("foo")).toBe(false);
    });

    it("should correctly return false for a deleted value", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      formData.delete("foo");
      expect(formData.has("foo")).toBe(false);
    });
  });

  describe(".keys()", () => {
    it("should correctly return a single key", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect([...formData.keys()]).toEqual(["foo"]);
    });

    it("should correctly return an array of keys", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      formData.append("bar", "baz");
      expect([...formData.keys()]).toEqual(["foo", "bar"]);
    });

    it("should not return deleted keys", () => {
      const formData = new FormData();
      formData.set("foo", "1");
      formData.set("bar", "2");
      formData.set("baz", "3");
      formData.set("qux", "4");
      formData.delete("bar");
      expect([...formData.keys()]).toEqual(["foo", "baz", "qux"]);
    });
  });

  describe(".values()", () => {
    it("should correctly return a single value", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect([...formData.values()]).toEqual(["bar"]);
    });

    it("should correctly return an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      formData.append("bar", "baz");
      expect([...formData.values()]).toEqual(["baz", "bar", "baz"]);
    });

    it("should not return deleted values", () => {
      const formData = new FormData();
      formData.set("foo", "1");
      formData.set("bar", "2");
      formData.set("baz", "3");
      formData.set("qux", "4");
      formData.delete("bar");
      expect([...formData.values()]).toEqual(["1", "3", "4"]);
    });
  });

  describe(".entries()", () => {
    it("should correctly return a single entry", () => {
      const formData = new FormData();
      formData.set("foo", "bar");
      expect([...formData.entries()]).toEqual([["foo", "bar"]]);
    });

    it("should correctly return an array of entries", () => {
      const formData = new FormData();
      formData.append("foo", "baz");
      formData.append("foo", "bar");
      formData.append("bar", "baz");
      expect([...formData.entries()]).toEqual([
        ["foo", "baz"],
        ["foo", "bar"],
        ["bar", "baz"],
      ]);
    });
  });

  describe(".forEach()", () => {
    it("should correctly call the callback for a single value", () => {
      const formData = new FormData();
      formData.append("foo", "1");

      const callbacksParams: any[] = [];

      formData.forEach((v, k) => {
        callbacksParams.push([v, k]);
      });

      expect(callbacksParams).toEqual([["1", "foo"]]);
    });

    it("should correctly call the callback for an array of values", () => {
      const formData = new FormData();
      formData.append("foo", "1");
      formData.append("foo", "2");
      formData.append("foo", "3");
      formData.append("bar", "1");

      const callbacksParams: any[] = [];

      formData.forEach((v, k) => {
        callbacksParams.push([v, k]);
      });

      expect(callbacksParams).toEqual([
        ["1", "foo"],
        ["2", "foo"],
        ["3", "foo"],
        ["1", "bar"],
      ]);
    });
  });
});
