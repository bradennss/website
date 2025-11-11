import { describe, expect, test } from "vitest";
import { deserializeServerUpdate, serializeServerUpdate } from "./server";

describe("serializeServerUpdate", () => {
  test("should serialize server update", () => {
    const update = {
      myId: 1,
      roomName: "test",
      clientCount: 1,
      clientUpdates: [{ id: 1, pointerXPercent: 100, pointerYPercent: 50 }],
      removeClientIds: null,
    };

    const serialized = serializeServerUpdate(update);

    expect(deserializeServerUpdate(serialized)).toEqual(update);
  });

  test("should throw with invalid input", () => {
    const update = {
      myId: "foo",
      roomName: 1,
      clientCount: "bar",
      clientUpdates: null,
      removeClientIds: null,
    };

    // @ts-expect-error - Should throw with invalid input
    expect(() => serializeServerUpdate(update)).toThrow();
  });
});

describe("deserializeServerUpdate", () => {
  test("should deserialize server update", () => {
    const update = {
      myId: 1,
      roomName: "test",
      clientCount: null,
      clientUpdates: [{ id: 1, pointerXPercent: 100, pointerYPercent: 50 }],
      removeClientIds: null,
    };
    const serialized = serializeServerUpdate(update);

    expect(deserializeServerUpdate(serialized)).toEqual(update);
  });

  test("should throw with invalid input", () => {
    const invalidData = new Uint8Array([0, 0, 0]);

    expect(() => deserializeServerUpdate(invalidData)).toThrow();
  });
});
