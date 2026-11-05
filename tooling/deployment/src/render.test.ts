import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderTemplate } from "./render.js";

describe("production workload contract", () => {
  it("renders restricted Sable workloads without project-created identities", () => {
    const template = readFileSync(
      new URL("../../../deploy/workloads.yaml.eta", import.meta.url),
      "utf8",
    );
    const manifest = renderTemplate(template, {
      WEB_IMAGE: "ghcr.io/bradennss/website/web@sha256:1234",
      PRESENCE_IMAGE: "ghcr.io/bradennss/website/presence@sha256:5678",
      PRESENCE_SERVER_URL: "wss://braden.lol/presence",
    });

    expect(manifest).not.toContain("kind: ServiceAccount");
    expect(manifest).not.toContain("registry-pull");
    expect(manifest.match(/serviceAccountName: workload/g)).toHaveLength(2);
    expect(manifest.match(/automountServiceAccountToken: false/g)).toHaveLength(
      2,
    );
    expect(manifest).toContain("type: Recreate");
    expect(manifest).toContain("replicas: 1");
    expect(manifest).toContain("value: wss://braden.lol/presence");
    expect(manifest).toContain("ghcr.io/bradennss/website/web@sha256:1234");
    expect(manifest).toContain(
      "ghcr.io/bradennss/website/presence@sha256:5678",
    );
  });
});

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
