import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const runnerPath = path.join(repoRoot, "tools", "data", "mirror_lumen_curves_to_runtime.py");
const pythonBin = process.env.PYTHON || "python";

function sha256Hex(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function makeWorkspace() {
  const root = await mkdtemp(path.join(os.tmpdir(), "cs-lumen-curves-"));
  const source = path.join(root, "donor", "data", "lumen_curves");
  const target = path.join(root, "runtime-data", "authority-reference", "lumen_curves");
  const manifest = path.join(root, "runtime-data", "authority-reference", "lumen_curves_manifest.json");
  await mkdir(source, { recursive: true });
  await mkdir(path.dirname(target), { recursive: true });
  return { root, source, target, manifest };
}

async function cleanupWorkspace(workspace) {
  await rm(workspace.root, { recursive: true, force: true });
}

async function runRunner(workspace, extraArgs = []) {
  const args = [
    runnerPath,
    "--allow-test-path-overrides",
    "--source",
    workspace.source,
    "--target",
    workspace.target,
    "--manifest",
    workspace.manifest,
    ...extraArgs,
  ];

  try {
    const result = await execFileAsync(pythonBin, args, { cwd: repoRoot, maxBuffer: 1024 * 1024 * 10 });
    return {
      code: 0,
      stdout: result.stdout,
      stderr: result.stderr,
      json: JSON.parse(result.stdout),
    };
  } catch (error) {
    return {
      code: Number.isInteger(error.code) ? error.code : 1,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      json: error.stdout ? JSON.parse(error.stdout) : null,
    };
  }
}

test("lumen curve mirror runner dry-run writes nothing", async () => {
  const workspace = await makeWorkspace();
  try {
    await writeFile(path.join(workspace.source, "curve-a.csv"), "model,lumen\nRAW-ROW-A\n", "utf-8");

    const result = await runRunner(workspace);

    assert.equal(result.code, 0);
    assert.equal(result.json.ok, true);
    assert.equal(result.json.dry_run, true);
    assert.equal(result.json.executed, false);
    assert.equal(result.json.file_count, 1);
    assert.equal(result.json.copied_count, 0);
    assert.equal(result.json.planned_copy_count, 1);
    assert.equal(result.json.manifest_written, false);
    assert.equal(existsSync(workspace.target), false);
    assert.equal(existsSync(workspace.manifest), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror runner execute copies CSV byte-for-byte", async () => {
  const workspace = await makeWorkspace();
  try {
    const first = Buffer.from("optic,lumen\nA,100\n");
    const second = Buffer.from("optic,lumen\nB,200\n");
    await writeFile(path.join(workspace.source, "curve-a.csv"), first);
    await writeFile(path.join(workspace.source, "curve-b.csv"), second);

    const result = await runRunner(workspace, ["--execute"]);

    assert.equal(result.code, 0);
    assert.equal(result.json.ok, true);
    assert.equal(result.json.dry_run, false);
    assert.equal(result.json.executed, true);
    assert.equal(result.json.copied_count, 2);
    assert.deepEqual(await readFile(path.join(workspace.target, "curve-a.csv")), first);
    assert.deepEqual(await readFile(path.join(workspace.target, "curve-b.csv")), second);
    assert.equal(existsSync(workspace.manifest), true);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror manifest has SHA-256 for every CSV and no raw rows", async () => {
  const workspace = await makeWorkspace();
  try {
    const first = Buffer.from("model,lumen\nRAW-CURVE-ROW-SHOULD-NOT-APPEAR\n");
    const second = Buffer.from("model,lumen\nANOTHER-RAW-CURVE-ROW\n");
    await writeFile(path.join(workspace.source, "curve-a.csv"), first);
    await writeFile(path.join(workspace.source, "curve-b.csv"), second);

    const result = await runRunner(workspace, ["--execute"]);
    const manifestText = await readFile(workspace.manifest, "utf-8");
    const manifest = JSON.parse(manifestText);

    assert.equal(result.code, 0);
    assert.equal(manifest.schema_id, "controlstack.runtime.authority-reference.lumen-curves-manifest");
    assert.equal(manifest.schema_version, 1);
    assert.equal(manifest.source_kind, "lumen_curve_csv_static_mirror");
    assert.equal(manifest.source_root_classification, "runtime-authority-reference");
    assert.equal(manifest.dry_run, false);
    assert.equal(manifest.executed, true);
    assert.equal(manifest.file_count, 2);
    assert.equal(manifest.copied_count, 2);
    assert.equal(manifest.already_mirrored_count, 0);
    assert.equal(manifest.conflict_count, 0);
    assert.equal(manifest.raw_curve_rows_included, false);
    assert.equal(manifest.active_snapshot_mutated, false);
    assert.equal(manifest.board_data_maker_imported, false);

    const byName = new Map(manifest.files.map((file) => [file.filename, file]));
    assert.equal(byName.get("curve-a.csv").sha256, sha256Hex(first));
    assert.equal(byName.get("curve-b.csv").sha256, sha256Hex(second));
    for (const file of manifest.files) {
      assert.match(file.sha256, /^[a-f0-9]{64}$/);
      assert.equal(file.relative_path, `lumen_curves/${file.filename}`);
      assert.equal(file.source_classification, "donor-static-mirror");
      assert.equal(file.raw_payload_in_manifest, false);
    }

    assert.equal(manifestText.includes("RAW-CURVE-ROW-SHOULD-NOT-APPEAR"), false);
    assert.equal(manifestText.includes("ANOTHER-RAW-CURVE-ROW"), false);
    assert.equal(manifestText.includes("model,lumen"), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror runner fails closed on differing existing target", async () => {
  const workspace = await makeWorkspace();
  try {
    await mkdir(workspace.target, { recursive: true });
    await writeFile(path.join(workspace.source, "curve-a.csv"), "model,lumen\nsource,100\n", "utf-8");
    await writeFile(path.join(workspace.target, "curve-a.csv"), "model,lumen\ntarget,999\n", "utf-8");

    const result = await runRunner(workspace, ["--execute"]);
    const targetText = await readFile(path.join(workspace.target, "curve-a.csv"), "utf-8");

    assert.equal(result.code, 2);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.blocker, "target-checksum-conflict");
    assert.equal(result.json.conflict_count, 1);
    assert.equal(result.json.copied_count, 0);
    assert.equal(result.json.manifest_written, false);
    assert.equal(targetText, "model,lumen\ntarget,999\n");
    assert.equal(existsSync(workspace.manifest), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror runner ignores non-CSV files safely", async () => {
  const workspace = await makeWorkspace();
  try {
    await writeFile(path.join(workspace.source, "curve-a.csv"), "model,lumen\nA,100\n", "utf-8");
    await writeFile(path.join(workspace.source, "notes.txt"), "not a curve csv", "utf-8");
    await mkdir(path.join(workspace.source, "nested"));

    const result = await runRunner(workspace, ["--execute"]);
    const targetEntries = await readdir(workspace.target);
    const manifest = JSON.parse(await readFile(workspace.manifest, "utf-8"));

    assert.equal(result.code, 0);
    assert.equal(result.json.ignored_count, 2);
    assert.deepEqual(targetEntries, ["curve-a.csv"]);
    assert.equal(manifest.file_count, 1);
    assert.equal(manifest.files[0].filename, "curve-a.csv");
    assert.equal(JSON.stringify(manifest).includes("notes.txt"), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror runner does not touch novondb.json", async () => {
  const workspace = await makeWorkspace();
  try {
    const activeSnapshot = path.join(workspace.root, "runtime-data", "authority-reference", "novondb.json");
    const snapshotText = JSON.stringify({ sentinel: "do-not-touch" }, null, 2);
    await writeFile(path.join(workspace.source, "curve-a.csv"), "model,lumen\nA,100\n", "utf-8");
    await writeFile(activeSnapshot, snapshotText, "utf-8");
    const before = await stat(activeSnapshot);

    const result = await runRunner(workspace, ["--execute"]);
    const afterText = await readFile(activeSnapshot, "utf-8");
    const after = await stat(activeSnapshot);

    assert.equal(result.code, 0);
    assert.equal(afterText, snapshotText);
    assert.equal(after.size, before.size);
    assert.equal(result.json.active_snapshot_mutated, false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("lumen curve mirror runner does not import board data maker and adds no route surface", async () => {
  const runnerText = await readFile(runnerPath, "utf-8");
  const serverText = await readFile(path.join(repoRoot, "server.js"), "utf-8");
  const importLines = runnerText
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("import ") || line.trim().startsWith("from "))
    .join("\n");

  assert.equal(runnerText.includes("BoardDataMaker"), false);
  assert.equal(importLines.includes("board"), false);
  assert.equal(importLines.includes("novondb"), false);
  assert.equal(serverText.includes("mirror_lumen_curves_to_runtime"), false);
  assert.equal(serverText.includes("lumen_curves_manifest"), false);
  assert.equal(serverText.includes("/api/lumen"), false);
});
