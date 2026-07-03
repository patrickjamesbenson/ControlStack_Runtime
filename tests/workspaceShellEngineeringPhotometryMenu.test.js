import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveWorkspaceRoute } from "../packages/workspace-kernel/route.js";

const shellIndexUrl = new URL("../apps/workspace-shell/index.html", import.meta.url);
const shellScriptUrl = new URL("../apps/workspace-shell/src/shell.js", import.meta.url);
const shellStylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);
const labIconUrl = new URL("../apps/workspace-shell/assets/lab-rail-icon.svg", import.meta.url);

async function shellIndex() {
  return readFile(shellIndexUrl, "utf-8");
}

async function shellScript() {
  return readFile(shellScriptUrl, "utf-8");
}

function sectionByGroup(source, groupName, nextGroupName) {
  const start = source.indexOf(`data-shell-nav-group="${groupName}"`);
  assert.ok(start > 0, `${groupName} menu group should exist`);
  const sectionStart = source.lastIndexOf("<section", start);
  const nextSection = source.indexOf(`data-shell-nav-group="${nextGroupName}"`, start);
  assert.ok(sectionStart > 0, `${groupName} section start should be present`);
  assert.ok(nextSection > sectionStart, `${groupName} section should appear before ${nextGroupName}`);
  return source.slice(sectionStart, nextSection);
}

function labSection(source) {
  return sectionByGroup(source, "lab", "engineering");
}

function engineeringSection(source) {
  return sectionByGroup(source, "engineering", "knowledge_governance");
}

function reportCardGroup(section) {
  const groupStart = section.indexOf(">Report Card / Datasheet Outputs<");
  const groupEnd = section.indexOf("</div>\n            </section>", groupStart);
  assert.ok(groupStart > 0, "Report Card / Datasheet Outputs group should exist");
  assert.ok(groupEnd > groupStart, "Report Card / Datasheet Outputs group should end before the Lab section closes");
  return section.slice(groupStart, groupEnd);
}

test("Workspace shell content still contains the mounted shell population anchors", async () => {
  const source = await shellIndex();

  assert.match(source, /id="cs-shell-root"/);
  assert.match(source, /id="cs-shell-module-host"/);
  assert.match(source, /id="cs-workspace-home"/);
  assert.match(source, /type="module" src="\/apps\/workspace-shell\/src\/shell\.js"/);
  assert.match(source, /data-shell-nav-group="lab"/);
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

test("Lab and Engineering taxonomy groups remain compatible with grouped flyout binding", async () => {
  const source = await shellIndex();
  const script = await shellScript();
  const lab = labSection(source);
  const engineering = engineeringSection(source);

  for (const section of [lab, engineering]) {
    assert.match(section, /data-shell-nav-mode="flyout"/);
    assert.match(section, /data-shell-nav-default="collapsed"/);
    assert.match(section, /role="menu"/);
  }
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
  const section = `${labSection(source)}\n${engineeringSection(source)}`;
  const disabledItems = Array.from(section.matchAll(/<button class="cs-shell__rail-item cs-shell__rail-taxonomy-item" role="menuitem" type="button" aria-disabled="true"[^>]*data-shell-status-rail="false">/g));

  assert.ok(disabledItems.length >= 30, "Preview-only taxonomy buttons should stay visible but disabled");
  assert.match(script, /function isDisabledRailControl\(control\)/);
  assert.match(script, /if \(!isDisabledRailControl\(control\)\) return;/);
  assert.match(script, /event\.preventDefault\(\);\s*event\.stopPropagation\(\);/s);
});

test("Lab top-level group renders with a dedicated local Lab icon", async () => {
  const source = await shellIndex();
  const lab = labSection(source);
  const icon = await readFile(labIconUrl, "utf-8");

  assert.match(lab, /aria-label="Lab"/);
  assert.match(lab, /Lab photometry authority menu/);
  assert.match(lab, /src="\/apps\/workspace-shell\/assets\/lab-rail-icon\.svg"/);
  assert.match(icon, /<svg[^>]+viewBox="0 0 64 64"/);
  assert.match(icon, /stroke="#ffffff"/);
  assert.doesNotMatch(icon, /href=|font/i);
});

test("Lab owns the photometry authority groups", async () => {
  const source = await shellIndex();
  const lab = labSection(source);

  for (const group of [
    "Intake",
    "Health Check",
    "1mm JSON / Lab Records",
    "Provenance",
    "Emergency Modes",
    "Approved References",
    "Project IES Export",
    "Report Card / Datasheet Outputs",
  ]) {
    assert.match(lab, new RegExp(`>${group}<`), `${group} should render as a Lab menu group`);
  }
});

test("Lab photometry taxonomy renders the required authority entries and status labels", async () => {
  const source = await shellIndex();
  const lab = labSection(source);

  for (const label of [
    "Reference IES Intake",
    "Uploaded Source Files",
    "Parsed Source Review",
    "File Stage Check",
    "Distribution Health",
    "Transform Readiness",
    "Orientation / Mounting State",
    "Downstream Eligibility",
    "1mm Draft Artefacts",
    "1mm Lab Records",
    "Transform / Mutation History",
    "Superseded / Rejected Records",
    "Power Reports",
    "Thermal Reports",
    "Light Performance Reports",
    "Supporting Documents",
    "Evidence Bundles",
    "Approval / Revision Status",
    "Battery Packs",
    "Inverters / Emergency Drivers",
    "Duration Evidence",
    "Emergency Reference Candidates",
    "Approved Emergency References",
    "Apply Battery to Modelled Electrical Zone",
    "Lab-Provenanced Candidates",
    "Approved 1mm Pure References",
    "Standard Reference Bindings",
    "Emergency Reference Bindings",
    "Runtime IES Source",
    "Generated Project IES",
    "Emergency Project IES",
    "Project Evidence Pointer",
    "IES Report Card Generator",
    "Datasheet HTML Output",
    "Polar SVG Output",
    "Linear SVG Output",
    "Intensity Table Output",
    "UGR Table Output",
    "Export Bundle",
  ]) {
    assert.match(lab, new RegExp(`>${label}<`), `${label} should render in the Lab photometry menu`);
  }

  for (const status of [
    "preview",
    "read-only intake",
    "health check",
    "requires provenance",
    "approved reference only",
    "project export disabled",
    "no IES generation",
    "no authority",
    "local export only",
    "downstream display",
    "production disabled",
  ]) {
    assert.match(lab, new RegExp(status), `${status} status should be visible`);
  }
});

test("Reference IES and Project IES are visibly separated in Lab", async () => {
  const source = await shellIndex();
  const lab = labSection(source);
  const referenceIndex = lab.indexOf(">Reference IES Intake<");
  const projectHeadingIndex = lab.indexOf(">Project IES Export<");
  const generatedIndex = lab.indexOf(">Generated Project IES<");

  assert.ok(referenceIndex > 0, "Reference IES Intake should exist");
  assert.ok(projectHeadingIndex > referenceIndex, "Project IES Export should be a later separate Lab group");
  assert.ok(generatedIndex > projectHeadingIndex, "Generated Project IES should sit under the project-export area");
  assert.match(lab, /Reference IES intake is source\/test\/lab intake only/);
  assert.match(lab, /Project IES is an external project\/export artefact/);
  assert.match(lab, /point back to lab record\/provenance IDs without carrying the full internal provenance record/);
});

test("1mm JSON / Lab Record authority wording is present", async () => {
  const source = await shellIndex();
  const lab = labSection(source);

  assert.match(lab, />1mm JSON \/ Lab Records</);
  assert.match(lab, />1mm Lab Records</);
  assert.match(lab, /internal Lab authority object for provenance, fingerprints, transform history, mutation history, approval\/revision state, emergency compatibility, and downstream eligibility/);
});

test("Report-card datasheet outputs remain under Lab and status-only", async () => {
  const source = await shellIndex();
  const lab = labSection(source);
  const engineering = engineeringSection(source);
  const group = reportCardGroup(lab);

  assert.doesNotMatch(engineering, />Report Card \/ Datasheet Outputs</);
  for (const [label, status] of [
    ["IES Report Card Generator", "downstream display"],
    ["Datasheet HTML Output", "downstream display"],
    ["Polar SVG Output", "downstream display"],
    ["Linear SVG Output", "downstream display"],
    ["Intensity Table Output", "local export only"],
    ["UGR Table Output", "downstream display"],
    ["Export Bundle", "local export only · no authority"],
  ]) {
    const itemPattern = new RegExp(`<button[^>]+aria-disabled="true"[^>]*><span>${label}</span><span class="cs-shell__rail-item-status">${status}</span></button>`);
    assert.match(group, itemPattern, `${label} should be disabled/status-only with ${status}`);
  }

  assert.match(group, /Existing Reference IES file → read-only parse → report-card JSON contract → datasheet and screen display assets/);
  assert.match(group, /no route, POST endpoint, or shell CLI execution is enabled/);
  assert.doesNotMatch(group, /href="/);
  assert.doesNotMatch(group, /data-module-link=/);
  assert.doesNotMatch(group, /method=["']post["']/i);
  assert.doesNotMatch(group, /fetch\([^)]*POST/i);
  assert.doesNotMatch(group, /renderReportCardCli|confirm-write|\/api\//i);
});

test("Engineering remains a separate design and tooling group", async () => {
  const source = await shellIndex();
  const engineering = engineeringSection(source);

  assert.match(engineering, /aria-label="Engineering"/);
  assert.match(engineering, /Engineering design and tooling menu/);
  for (const group of ["Kernel Tools", "Design Intent"]) {
    assert.match(engineering, new RegExp(`>${group}<`), `${group} should render as an Engineering menu group`);
  }

  for (const label of [
    "Photometry Kernel Tools",
    "Runtime IES Scaler",
    "Angular Interpolation Policy",
    "Hemisphere Padding Policy",
    "Direct / Indirect Combine Policy",
    "Candela Mirror Policy",
    "Optic Design",
    "System / Board / Driver Design",
    "Emergency System Design",
    "Engineering Handoff to Lab",
  ]) {
    assert.match(engineering, new RegExp(`>${label}<`), `${label} should render in Engineering`);
  }

  for (const status of [
    "design intent",
    "tool preview",
    "handoff to Lab",
    "production disabled",
  ]) {
    assert.match(engineering, new RegExp(status), `${status} status should be visible`);
  }
});

test("Engineering no longer presents Lab-owned authority group headings", async () => {
  const source = await shellIndex();
  const engineering = engineeringSection(source);

  for (const labOwnedHeading of [
    "Intake",
    "Health Check",
    "1mm JSON / Lab Records",
    "Provenance",
    "Emergency Modes",
    "Approved References",
    "Project IES Export",
    "Report Card / Datasheet Outputs",
  ]) {
    assert.doesNotMatch(engineering, new RegExp(`>${labOwnedHeading}<`), `${labOwnedHeading} should not be an Engineering heading`);
  }
});

test("Lab and Engineering menus do not enable production generation actions", async () => {
  const source = await shellIndex();
  const sections = `${labSection(source)}\n${engineeringSection(source)}`;

  assert.doesNotMatch(sections, /method=["']post["']/i);
  assert.doesNotMatch(sections, /fetch\([^)]*POST/i);
  assert.doesNotMatch(sections, /\/api\/(?:ies|photometry|engine|runtable|reference)[^"']*(?:generate|create|approve|promote|run)/i);
  assert.doesNotMatch(sections, /run_engine|donor Engine|donor photometry/i);

  for (const label of [
    "Uploaded Source Files",
    "Parsed Source Review",
    "Generated Project IES",
    "Emergency Project IES",
    "IES Report Card Generator",
    "Datasheet HTML Output",
    "Polar SVG Output",
    "Linear SVG Output",
    "Intensity Table Output",
    "UGR Table Output",
    "Export Bundle",
    "Runtime IES Scaler",
    "Engineering Handoff to Lab",
  ]) {
    const itemPattern = new RegExp(`<button[^>]+aria-disabled="true"[^>]*><span>${label}</span>`);
    assert.match(sections, itemPattern, `${label} should be a disabled menu item where it would otherwise imply action`);
  }
});

test("Lab and Engineering menus route only to existing safe diagnostic modules", async () => {
  const source = await shellIndex();
  const sections = `${labSection(source)}\n${engineeringSection(source)}`;
  const allowedHrefs = new Set([
    "/workspace?module=ies_builder",
    "/workspace?module=lab_proof",
    "/workspace?module=emergence",
    "/workspace?module=admin_dev",
  ]);

  const hrefs = Array.from(sections.matchAll(/href="([^"]+)"/g), (match) => match[1]);
  assert.ok(hrefs.length > 0, "Lab menu should retain safe diagnostic links");
  for (const href of hrefs) {
    assert.ok(allowedHrefs.has(href), `Unexpected Lab/Engineering route: ${href}`);
  }

  assert.equal(hrefs.some((href) => /generate|run|approve|promote|upload|export/i.test(href)), false);
});

test("Lab and Engineering taxonomy menu styling supports grouped readiness labels", async () => {
  const styles = await readFile(shellStylesUrl, "utf-8");

  assert.match(styles, /\.cs-shell__rail-group--authority-taxonomy \.cs-shell__rail-group-items/);
  assert.match(styles, /\.cs-shell__rail-taxonomy-heading/);
  assert.match(styles, /\.cs-shell__rail-item-status/);
  assert.match(styles, /\.cs-shell__rail-taxonomy-item\[aria-disabled="true"\]/);
  assert.match(styles, /\[data-shell-nav-group="lab"\] \{ order: 280; \}/);
  assert.match(styles, /\[data-shell-nav-group="engineering"\] \{ order: 300; \}/);
  assert.doesNotMatch(styles, /\[data-shell-nav-group="engineering_authority"\]/);
});
