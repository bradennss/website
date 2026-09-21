import { Eta } from "eta";

const templateVariablePattern = /<%=\s*it\.([A-Z][A-Z0-9_]*)\s*%>/g;
const eta = new Eta({ autoEscape: false, autoTrim: false });

export function renderTemplate(
  template: string,
  environment: NodeJS.ProcessEnv,
): string {
  const variables = new Set(
    [...template.matchAll(templateVariablePattern)].map((match) => match[1]),
  );
  const missingVariables = [...variables].filter(
    (variable) => !environment[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing template variables: ${missingVariables.sort().join(", ")}`,
    );
  }

  return eta.renderString(template, environment);
}
