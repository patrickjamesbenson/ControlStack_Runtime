import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveWorkspaceRoute } from "../packages/workspace-kernel/route.js";

const shellIndexUrl = new URL("../apps/workspace-shell/index.html", import.meta.url);
const shellScriptUrl = new URL("../apps/workspace-shell/src/shell.js", import.meta.url);
const shellStylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

async function shellIndex() {
  return readFile(shellIndexUrl, "utf-8");
}

async function shellScript() {
  return readFile(shellScriptUrl, "utf-8");
}

function engineeringSection(source) {
  const start = source.indexOf('data-shell-nav-group="engineering"');
  assert.ok(start > 0, "Engineering menu group should exist");
  const sectionStart = source.lastIndexOf("<section", start);
  const nextSection = source.indexOf('data-shell-nav-group="knowledge_governance"', start);
  assert.ok(sectionStart > 0, "Engineering section start should be present");
  assert.ok(nextSection > sectionStart, "Engineering section should appear before Knowledge & Governance");
  return source.slice(sectionStart, nextSection);
}

test("Workspace shell content still contains the mounted shell population anchors", async () => {
  const source = await shellIndex();

  assert.match(source, /id="cs-shell-root"/);
  assert.match(source, /id="cs-shell-module-host"/);
  assert.match(source, /id="cs-workspace-home"/);
  assert.match(source, /type="module" src="\/apps\/workspace-shell\/src\/shell\.js"/);
  assert.match(source, /data-shell-nav-group="engineering"/);
});

test("Workspace shell route resolver keeps root, Selector, and home routes safe", () => {
  const rootRoute = resolveWorkspaceRoute({ href: "http://127.0.0.1:8787/workspace" });
  assert.equal(rootRoute.moduleId, "cs_selector");
  assert.equal(rootRoute.routeFallbackApplied, false);
  assert.equal(rootRoute.goldenRoute, "/workspace?module=cs_selector");

  const selectorRoute = resolveWorkspaceRoute({ href: "http://127.0.0.1:8787/workspace?module=cs_selector" });
  assert.equal(selectorRoute.moduleId, "cs_selector");
  assert.equal(selectorRoute.routeFallbackApplied, false);

  const homeRoute = resolveWorkspaceRoute({ href: "http://127.0.0.1:8787/workspace?module=workspace_home" });
  assert.equal(homeRoute.moduleId, "workspace_home");
  assert.equal(homeRoute.routeFallbackApplied, false);
  assert.equal(homeRoute.goldenRoute, "/workspace?module=workspace_home");
});

test("Workspace shell route resolver falls unknown module queries back to home", () => {
  const route = resolveWorkspaceRoute({ href: "http://127.0.0.1:8787/workspace?module=missing_runtime_module" });

  assert.equal(route.requestedModuleId, "missing_runtime_module");
  assert.equal(route.moduleId, "workspace_home");
  assert.equal(route.fallbackModuleId, "workspace_home");
  assert.equal(route.routeFallbackApplied, true);
  assert.equal(route.goldenRoute, "/workspace?module=workspace_home");
});

test("Workspace shell binds rail and topbar before initial render can isolate failures", async () => {
  const script = await shellScript();

  assert.match(script, /function bindGroupedRailNavigation\(\)/);
  assert.match(script, /function bindShellTopbarControls\(\)/);
  assert.match(script, /function refreshContextSafely\(reason = "context-refresh"\)/);
  assert.match(script, /refreshContextSafely\("initial-render"\)/);
  assert.ok(
    script.indexOf("bindGroupedRailNavigation();") < script.indexOf('refreshContextSafely("initial-render")'),
    "Grouped rail binding should happen before initial render isolation",
  );
  assert.ok(
    script.indexOf("bindShellTopbarControls();") < script.indexOf('refreshContextSafely("initial-render")'),
    "Topbar binding should happen before initial render isolation",
  );
});

test("Engineering taxonomy group remains compatible with grouped flyout binding", async () => {
  const source = await shellIndex();
  const script = await shellScript();
  const section = engineeringSection(source);

  assert.match(section, /data-shell-nav-mode="flyout"/);
  assert.match(section, /data-shell-nav-default="collapsed"/);
  assert.match(section, /role="menu"/);
  assert.match(script, /document\.querySelectorAll\("\.cs-shell__rail-group"\)/);
  assert.match(script, /setRailGroupExpanded\(group, group\.dataset\.shellNavDefault === "expanded"\)/);
  assert.match(script, /markRailFlyoutHover\(group, control\)/);
});

test("Selector module link remains navigable from the shell rail", async () => {
  const source = await shellIndex();
  const selectorLink = source.match(/<a class="cs-shell__rail-item" href="\/workspace\?module=cs_selector" data-module-link="cs_selector">/);

  assert.ok(selectorLink, "Selector rail link should exist with the cs_selector route");
  assert.doesNotMatch(selectorLink[0], /data-shell-status-rail="false"/);
  assert.equal(resolveWorkspaceRoute({ href: "http://127.0.0.1:8787/workspace?module=cs_selector" }).moduleId, "cs_selector");
});

test("Disabled preview menu items are inert and do not block rail binding", async () => {
  const source = await shellIndex();
  const script = await shellScript();
  const section = engineeringSection(source);
  const disabledItems = Array.from(section.matchAll(/<button class="cs-shell__rail-item cs-shell__rail-taxonomy-item" role="menuitem" type="button" aria-disabled="true"[^>]*data-shell-status-rail="false">/g));

  assert.ok(disabledItems.length >= 10, "Preview-only taxonomy buttons should stay visible but disabled");
  assert.match(script, /function isDisabledRailControl\(control\)/);
  assert.match(script, /if \(!isDisabledRailControl\(control\)\) return;/);
  assert.match(script, /event\.preventDefault\(\);\s*event\.stopPropagation\(\);/s);
});

test("Engineering section renders the approved photometry authority groups", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);

  assert.match(section, /aria-label="Engineering"/);
  assert.match(section, /Engineering photometry authority menu/);

  for (const group of [
    "Kernel Tools",
    "Candidate Luminaires",
    "Pure References",
    "Lab Provenance",
    "Emergency Systems",
    "Approved Fittings",
    "Runtime Outputs",
    "Report Card / Datasheet Outputs",
  ]) {
    assert.match(section, new RegExp(`>${group}<`), `${group} should render as an Engineering menu group`);
  }
});

test("Engineering photometry taxonomy renders the approved journey entries", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);

  for (const label of [
    "IES Parser",
    "1mm Canonicaliser",
    "Hemisphere Padder",
    "Direct / Indirect Combiner",
    "Candela Mirror Tool",
    "Runtime IES Scaler",
    "Emergency Mode Builder",
    "Uploaded Files",
    "1mm Draft Artefacts",
    "Manipulated Artefacts",
    "Reference Candidates",
    "Blocked / Missing Evidence",
    "Lab-Provenanced Candidates",
    "Approved 1mm Pure References",
    "Superseded References",
    "Rejected References",
    "Power Reports",
    "Thermal Reports",
    "Light Performance Reports",
    "Supporting Documents",
    "Evidence Bundles",
    "Approval / Revision Status",
    "Standard Fittings",
    "Emergency Fittings",
    "System / Optic / Reference Bindings",
    "Runtime IES Source",
    "Generated Project IES",
    "Emergency Project IES",
    "Project Evidence Pack",
    "IES Report Card Generator",
    "Datasheet HTML Output",
    "Polar SVG Output",
    "Linear SVG Output",
    "Intensity Table Output",
    "Export Bundle",
  ]) {
    assert.match(section, new RegExp(`>${label}<`), `${label} should render in the Engineering photometry menu`);
  }

  for (const status of [
    "preview",
    "not implemented",
    "blocked",
    "requires lab provenance",
    "approved reference only",
    "runtime generation disabled",
    "read-only IES consumer",
    "local export only",
    "datasheet output",
    "screen display",
    "no IES generation",
    "no authority",
  ]) {
    assert.match(section, new RegExp(status), `${status} status should be visible`);
  }
});

test("Report-card datasheet output menu remains downstream status-only", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);
  const groupStart = section.indexOf(">Report Card / Datasheet Outputs<");
  const groupEnd = section.indexOf("cs-shell__rail-item--admin", groupStart);
  assert.ok(groupStart > 0, "Report Card / Datasheet Outputs group should exist");
  assert.ok(groupEnd > groupStart, "Report Card / Datasheet Outputs group should end before admin link");
  const group = section.slice(groupStart, groupEnd);

  for (const [label, status] of [
    ["IES Report Card Generator", "read-only IES consumer"],
    ["Datasheet HTML Output", "datasheet output"],
    ["Polar SVG Output", "screen display"],
    ["Linear SVG Output", "screen display"],
    ["Intensity Table Output", "local export only"],
    ["Export Bundle", "no IES generation · no authority"],
  ]) {
    const itemPattern = new RegExp(`<button[^>]+aria-disabled="true"[^>]*><span>${label}</span><span class="cs-shell__rail-item-status">${status}</span></button>`);
    assert.match(group, itemPattern, `${label} should be disabled/status-only with ${status}`);
  }

  assert.match(group, /Existing IES file → read-only parse → report-card JSON contract → datasheet and screen display assets/);
  assert.match(group, /no route, POST endpoint, or shell CLI execution is enabled/);
  assert.doesNotMatch(group, /href="/);
  assert.doesNotMatch(group, /data-module-link=/);
  assert.doesNotMatch(group, /method=["']post["']/i);
  assert.doesNotMatch(group, /fetch\([^)]*POST/i);
  assert.doesNotMatch(group, /renderReportCardCli|confirm-write|\/api\//i);
});

test("Emergency photometry menu entries render without implying normal-photometry substitution", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);

  for (const label of [
    "Battery Packs",
    "Inverters / Emergency Drivers",
    "Duration Evidence",
    "Emergency Reference Candidates",
    "Approved Emergency References",
    "Emergency Project IES",
  ]) {
    assert.match(section, new RegExp(`>${label}<`), `${label} should render in emergency authority areas`);
  }

  assert.match(section, /Emergency mode photometry requires battery, inverter, and end-of-duration provenance/);
  assert.match(section, /Emergency reference candidates require battery, inverter, and duration evidence before promotion/);
});

test("Engineering photometry menu does not enable production generation actions", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);

  assert.doesNotMatch(section, /method=["']post["']/i);
  assert.doesNotMatch(section, /fetch\([^)]*POST/i);
  assert.doesNotMatch(section, /\/api\/(?:ies|photometry|engine|runtable|reference)[^"']*(?:generate|create|approve|promote|run)/i);
  assert.doesNotMatch(section, /run_engine|donor Engine|donor photometry/i);

  for (const label of [
    "Runtime IES Scaler",
    "Generated Project IES",
    "Emergency Project IES",
    "Project Evidence Pack",
    "IES Report Card Generator",
    "Datasheet HTML Output",
    "Polar SVG Output",
    "Linear SVG Output",
    "Intensity Table Output",
    "Export Bundle",
  ]) {
    const itemPattern = new RegExp(`<button[^>]+aria-disabled="true"[^>]*><span>${label}</span>`);
    assert.match(section, itemPattern, `${label} should be a disabled menu item`);
  }
});

test("Engineering photometry menu routes only to existing safe diagnostic modules", async () => {
  const source = await shellIndex();
  const section = engineeringSection(source);
  const allowedHrefs = new Set([
    "/workspace?module=ies_builder",
    "/workspace?module=lab_proof",
    "/workspace?module=emergence",
    "/workspace?module=board_data",
    "/workspace?module=admin_dev",
  ]);

  const hrefs = Array.from(section.matchAll(/href="([^"]+)"/g), (match) => match[1]);
  assert.ok(hrefs.length > 0, "Engineering menu should retain safe diagnostic links");
  for (const href of hrefs) {
    assert.ok(allowedHrefs.has(href), `Unexpected Engineering route: ${href}`);
  }

  assert.equal(hrefs.some((href) => /generate|run|approve|promote|upload|export/i.test(href)), false);
});

test("Engineering photometry menu styling supports grouped readiness labels", async () => {
  const styles = await readFile(shellStylesUrl, "utf-8");

  assert.match(styles, /\.cs-shell__rail-group--engineering-taxonomy \.cs-shell__rail-group-items/);
  assert.match(styles, /\.cs-shell__rail-taxonomy-heading/);
  assert.match(styles, /\.cs-shell__rail-item-status/);
  assert.match(styles, /\.cs-shell__rail-taxonomy-item\[aria-disabled="true"\]/);
  assert.match(styles, /\[data-shell-nav-group="engineering"\] \{ order: 300; \}/);
  assert.doesNotMatch(styles, /\[data-shell-nav-group="engineering_authority"\]/);
});
