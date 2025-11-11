import { describe, expect, test } from "vitest";
import { deserializeClientUpdate, serializeClientUpdate } from "./client";

describe("serializeClientUpdate", () => {
  test("should serialize client update", () => {
    const update = {
      roomName: "test",
      pointerXPercent: 100,
      pointerYPercent: 50,
    };
    const serialized = serializeClientUpdate(update);

    expect(deserializeClientUpdate(serialized)).toEqual(update);
  });

  test("should throw with invalid input", () => {
    const update = {
      cursorX: true,
      cursorY: "foo",
      path: 4,
    };

    // @ts-expect-error - Should throw with invalid input
    expect(() => serializeClientUpdate(update)).toThrow();
  });
});

describe("deserializeClientUpdate", () => {
  test("should deserialize client update", () => {
    const update = {
      roomName: "test",
      pointerXPercent: 100,
      pointerYPercent: 50,
    };
    const serialized = serializeClientUpdate(update);

    expect(deserializeClientUpdate(serialized)).toEqual(update);
  });

  test("should throw with invalid input", () => {
    const invalidData = new Uint8Array([1, 2, 3]);

    expect(() => deserializeClientUpdate(invalidData)).toThrow();
  });
});
