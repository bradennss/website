import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  server: {
    PRESENCE_SERVER_URL: z.string().default("ws://localhost:3001"),
  },
  runtimeEnv: {
    PRESENCE_SERVER_URL: process.env.PRESENCE_SERVER_URL,
  },
});
