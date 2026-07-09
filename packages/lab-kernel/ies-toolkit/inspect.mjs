// Dev runner (Node CLI, not part of the browser-safe toolkit surface):
//   node packages/lab-kernel/ies-toolkit/inspect.mjs <path-to.ies>
import { readFileSync } from "node:fs";
import { parseIes } from "./iesParse.js";
import { describeIes, formatDescription } from "./iesInspect.js";
const path = process.argv[2];
if (!path){ console.error("usage: node inspect.mjs <file.ies>"); process.exit(1); }
console.log(formatDescription(describeIes(parseIes(readFileSync(path)))));
