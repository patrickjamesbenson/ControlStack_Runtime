import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shellIndexUrl = new URL("../apps/workspace-shell/index.html", import.meta.url);
const shellStylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

async function shellIndex() {
  return readFile(shellIndexUrl, "utf-8");
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
  ]) {
    assert.match(section, new RegExp(status), `${status} status should be visible`);
  }
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

  for (const label of ["Runtime IES Scaler", "Generated Project IES", "Emergency Project IES", "Project Evidence Pack"]) {
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
