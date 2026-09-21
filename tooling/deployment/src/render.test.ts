import { describe, expect, it } from "vitest";
import { renderTemplate } from "./render.js";

describe("renderTemplate", () => {
  it("renders every declared environment variable", () => {
    const template =
      "image: <%= it.IMAGE %>\npresence: <%= it.PRESENCE_SERVER_URL %>\n";

    expect(
      renderTemplate(template, {
        IMAGE: "registry.example/app@sha256:1234",
        PRESENCE_SERVER_URL: "wss://example.com/presence",
      }),
    ).toBe(
      "image: registry.example/app@sha256:1234\npresence: wss://example.com/presence\n",
    );
  });

  it("rejects missing environment variables", () => {
    expect(() => renderTemplate("image: <%= it.IMAGE %>\n", {})).toThrowError(
      "Missing template variables: IMAGE",
    );
  });
});
