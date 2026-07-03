import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, relative, resolve } from "node:path";

import {
  freezeForHash,
  stableSha1,
} from "../packages/workspace-kernel/stableFingerprint.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";

const repoRootUrl = new URL("../", import.meta.url);
const repoRootPath = fileURLToPath(repoRootUrl);
const forbiddenNodeBuiltins = Object.freeze([
  "node:crypto",
  "node:fs",
  "node:path",
  "node:os",
  "node:url",
]);

const browserReachableEntrypoints = Object.freeze([
  "apps/workspace-shell/src/shell.js",
  "packages/modules/cs-selector/index.js",
  "packages/modules/cs-selector/selectorView.js",
  "packages/modules/cs-selector/selectorViewModel.js",
  "packages/modules/cs-selector/selectorSafeDraftProjectEnvelopePreview.js",
  "packages/modules/cs-selector/selectorSafeHydrateValidationPreview.js",
]);

const serverOnlyRuntimeServices = Object.freeze([
  "packages/workspace-kernel/runtimeDataReadOnlySourceAccessService.js",
  "packages/workspace-kernel/runtimeDriverUtilCurveLookupContract.js",
  "packages/workspace-kernel/runtimeLumenCurveDataHomeStatusService.js",
  "packages/workspace-kernel/runtimeLumenCurveLookupContract.js",
  "packages/workspace-kernel/runtimeLumenCurveParseInterpolationContract.js",
  "packages/workspace-kernel/selectorReferenceOptionsService.js",
  "packages/workspace-kernel/selectorReferenceService.js",
]);

function normaliseRelativePath(fileUrl) {
  return relative(repoRootPath, fileURLToPath(fileUrl)).replace(/\\/g, "/");
}

function isLocalSpecifier(specifier) {
  return specifier.startsWith(".") || specifier.startsWith("/");
}

function resolveLocalSpecifier(specifier, fromUrl) {
  if (specifier.startsWith("/")) return new URL(`.${specifier}`, repoRootUrl);
  return new URL(specifier, fromUrl);
}

function importSpecifiers(source) {
  const specifiers = [];
  const staticImportOrExport = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImport = /import\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of source.matchAll(staticImportOrExport)) specifiers.push(match[1]);
  for (const match of source.matchAll(dynamicImport)) specifiers.push(match[1]);
  return specifiers;
}

async function collectBrowserImportGraph(entrypoints) {
  const pending = entrypoints.map((entrypoint) => pathToFileURL(resolve(repoRootPath, entrypoint)));
  const visited = new Set();
  const nodeBuiltinImports = [];

  while (pending.length > 0) {
    const fileUrl = pending.pop();
    const relativePath = normaliseRelativePath(fileUrl);
    if (visited.has(relativePath)) continue;
    visited.add(relativePath);

    const source = await readFile(fileUrl, "utf-8");
    for (const specifier of importSpecifiers(source)) {
      if (specifier.startsWith("node:")) {
        nodeBuiltinImports.push({ from: relativePath, specifier });
        continue;
      }
      if (!isLocalSpecifier(specifier)) continue;
      const resolvedUrl = resolveLocalSpecifier(specifier, fileUrl);
      if (!resolvedUrl.pathname.endsWith(".js")) continue;
      pending.push(resolvedUrl);
    }
  }

  return { visited, nodeBuiltinImports };
}

function nodeStableSha1(value) {
  return createHash("sha1")
    .update(JSON.stringify(freezeForHash(value)))
    .digest("hex");
}

test("browser-safe stable fingerprint helper remains deterministic and Node-compatible", () => {
  const first = stableSha1({ b: 2, a: ["x", "y"], nested: { z: true } });
  const reordered = stableSha1({ nested: { z: true }, a: ["x", "y"], b: 2 });
  const changed = stableSha1({ b: 3, a: ["x", "y"], nested: { z: true } });

  assert.match(first, /^[0-9a-f]{40}$/);
  assert.equal(first, reordered);
  assert.notEqual(first, changed);
  assert.equal(first, nodeStableSha1({ b: 2, a: ["x", "y"], nested: { z: true } }));
  assert.equal(stableSha1(undefined), "da39a3ee5e6b4b0d3255bfef95601890afd80709");
});

test("policy index kernel no longer imports node:crypto", async () => {
  const source = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimePolicyIndexKernel.js", import.meta.url),
    "utf-8",
  );

  assert.equal(source.includes("node:crypto"), false);
  assert.equal(source.includes("createHash"), false);
  assert.match(source, /from ["']\.\/stableFingerprint\.js["']/);
});

test("browser-reachable shell and Selector graph imports no Node builtins", async () => {
  const graph = await collectBrowserImportGraph(browserReachableEntrypoints);

  assert.deepEqual(graph.nodeBuiltinImports, []);
  for (const builtin of forbiddenNodeBuiltins) {
    assert.equal(
      graph.nodeBuiltinImports.some((entry) => entry.specifier === builtin),
      false,
      `${builtin} must not be imported by browser-reachable modules`,
    );
  }
});

test("browser-reachable shell and Selector graph does not pull server-only source readers", async () => {
  const graph = await collectBrowserImportGraph(browserReachableEntrypoints);

  for (const servicePath of serverOnlyRuntimeServices) {
    assert.equal(graph.visited.has(servicePath), false, `${servicePath} must remain server-only`);
  }
});

test("Selector view model imports in the static browser graph without node builtins", () => {
  assert.equal(typeof createSelectorViewModel, "function");
});
