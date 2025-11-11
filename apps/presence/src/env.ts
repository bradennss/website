import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import z from "zod";

config({ quiet: true });

const PREFIX = "PRESENCE_";

function getVar(key: string) {
  return process.env[PREFIX + key] ?? process.env[key];
}

export const env = createEnv({
  server: {
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(3000),
  },
  runtimeEnvStrict: {
    HOST: getVar("HOST"),
    PORT: getVar("PORT"),
  },
});
