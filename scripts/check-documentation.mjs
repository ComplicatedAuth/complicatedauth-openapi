import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const document = parse(
  await readFile(new URL("../openapi.yaml", import.meta.url), "utf8"),
);
const failures = [];
const methods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
]);
const operations = [];

for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem ?? {})) {
    if (!methods.has(method)) continue;
    const label = `${method.toUpperCase()} ${path}`;
    operations.push(operation);
    for (const field of ["operationId", "summary", "description", "responses"]) {
      const value = operation?.[field];
      if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
        failures.push(`${label} is missing ${field}`);
      }
    }
    const responseCodes = Object.keys(operation?.responses ?? {});
    if (!responseCodes.some((code) => /^[23](?:\d{2}|XX)$/.test(code))) {
      failures.push(`${label} has no declared 2xx or 3xx success response`);
    }
  }
}

for (const tag of document.tags ?? []) {
  if (!tag.description) failures.push(`tag ${tag.name} is missing description`);
}

const components = document.components ?? {};
for (const [name, schema] of Object.entries(components.schemas ?? {})) {
  if (!schema?.description) failures.push(`schema ${name} is missing description`);
}
for (const [name, parameter] of Object.entries(components.parameters ?? {})) {
  if (!parameter?.description) failures.push(`parameter ${name} is missing description`);
}
for (const [name, scheme] of Object.entries(components.securitySchemes ?? {})) {
  if (!scheme?.description) {
    failures.push(`security scheme ${name} is missing description`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Verified authored documentation for ${operations.length} operations, ${Object.keys(components.schemas ?? {}).length} schemas, ${Object.keys(components.parameters ?? {}).length} parameters, and ${(document.tags ?? []).length} tags.`,
  );
}
