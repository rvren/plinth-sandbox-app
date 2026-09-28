// CI for the sandbox: the dashboard's default order must list every panel exactly once, and
// each must be a spec defined in the same file. Pure text reading — nothing is imported.
import { readFileSync } from "node:fs";

const text = readFileSync("src/catalog/specs.ts", "utf8");
const block = /export const defaultDashboard[^=]*=\s*\[([\s\S]*?)\];/.exec(text);
if (!block) throw new Error("defaultDashboard not found");
// A spread of a local array (`...operations`) stands for that array's entries, in place.
const listOf = (name) => {
  const found = new RegExp(`const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\];`).exec(text);
  if (!found) throw new Error(`${name} not found`);
  return found[1].split(",").map((s) => s.trim()).filter(Boolean);
};
const names = block[1]
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .flatMap((n) => (n.startsWith("...") ? listOf(n.slice(3)) : [n]));
const defined = new Set([...text.matchAll(/export const (\w+) = spec\(/g)].map((m) => m[1]));
const problems = [];
if (new Set(names).size !== names.length) problems.push("a panel is listed twice");
for (const n of names) if (!defined.has(n)) problems.push(`${n} is not a spec in this file`);
if (names.length !== 9) problems.push(`expected 9 panels, found ${names.length}`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`defaultDashboard lists ${names.length} panels: ${names.join(", ")}`);
