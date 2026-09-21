import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { renderTemplate } from "./render.js";

const { values } = parseArgs({
  options: {
    output: { type: "string" },
    template: { type: "string" },
  },
  strict: true,
});

if (!values.template || !values.output) {
  throw new Error("Usage: render --template <path> --output <path>");
}

const workingDirectory = process.env.INIT_CWD ?? process.cwd();
const templatePath = resolve(workingDirectory, values.template);
const outputPath = resolve(workingDirectory, values.output);
const template = await readFile(templatePath, "utf8");
const rendered = renderTemplate(template, process.env);
await writeFile(outputPath, rendered);
