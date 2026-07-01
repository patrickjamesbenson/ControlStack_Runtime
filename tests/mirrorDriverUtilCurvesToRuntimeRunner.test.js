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
const runnerPath = path.join(repoRoot, "tools", "data", "mirror_driver_util_curves_to_runtime.py");
const pythonBin = process.env.PYTHON || "python";

function sha256Hex(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function makeWorkspace() {
  const root = await mkdtemp(path.join(os.tmpdir(), "cs-driver-util-curves-"));
  const source = path.join(root, "donor", "data", "driver_util_curves");
  const target = path.join(root, "runtime-data", "authority-reference", "driver_util_curves");
  const manifest = path.join(root, "runtime-data", "authority-reference", "driver_util_curves_manifest.json");
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

test("driver util curve mirror runner dry-run writes nothing", async () => {
  const workspace = await makeWorkspace();
  try {
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), '{"curve":"RAW-DRIVER-UTIL-A"}\n', "utf-8");

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

test("driver util curve mirror runner execute copies JSON byte-for-byte", async () => {
  const workspace = await makeWorkspace();
  try {
    const first = Buffer.from('{"driver":"A","util":[0.1,0.2]}\n');
    const second = Buffer.from('{"driver":"B","util":[0.3,0.4]}\n');
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), first);
    await writeFile(path.join(workspace.source, "driver_util_beta.json"), second);

    const result = await runRunner(workspace, ["--execute"]);

    assert.equal(result.code, 0);
    assert.equal(result.json.ok, true);
    assert.equal(result.json.dry_run, false);
    assert.equal(result.json.executed, true);
    assert.equal(result.json.copied_count, 2);
    assert.deepEqual(await readFile(path.join(workspace.target, "driver_util_alpha.json")), first);
    assert.deepEqual(await readFile(path.join(workspace.target, "driver_util_beta.json")), second);
    assert.equal(existsSync(workspace.manifest), true);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("driver util curve mirror manifest has SHA-256 for every JSON and no raw payloads", async () => {
  const workspace = await makeWorkspace();
  try {
    const first = Buffer.from('{"curve":"RAW-DRIVER-UTIL-PAYLOAD-SHOULD-NOT-APPEAR"}\n');
    const second = Buffer.from('{"curve":"ANOTHER-RAW-DRIVER-UTIL-PAYLOAD"}\n');
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), first);
    await writeFile(path.join(workspace.source, "driver_util_beta.json"), second);

    const result = await runRunner(workspace, ["--execute"]);
    const manifestText = await readFile(workspace.manifest, "utf-8");
    const manifest = JSON.parse(manifestText);

    assert.equal(result.code, 0);
    assert.equal(manifest.schema_id, "controlstack.runtime.authority-reference.driver-util-curves-manifest");
    assert.equal(manifest.schema_version, 1);
    assert.equal(manifest.source_kind, "driver_util_curve_json_static_mirror");
    assert.equal(manifest.source_root_classification, "donor-static-driver-util-source");
    assert.equal(manifest.dry_run, false);
    assert.equal(manifest.executed, true);
    assert.equal(manifest.file_count, 2);
    assert.equal(manifest.copied_count, 2);
    assert.equal(manifest.already_mirrored_count, 0);
    assert.equal(manifest.conflict_count, 0);
    assert.equal(manifest.raw_driver_util_payloads_included, false);
    assert.equal(manifest.active_snapshot_mutated, false);
    assert.equal(manifest.board_data_maker_imported, false);
    assert.equal(manifest.donor_files_mutated, false);

    const byName = new Map(manifest.files.map((file) => [file.filename, file]));
    assert.equal(byName.get("driver_util_alpha.json").sha256, sha256Hex(first));
    assert.equal(byName.get("driver_util_beta.json").sha256, sha256Hex(second));
    for (const file of manifest.files) {
      assert.match(file.sha256, /^[a-f0-9]{64}$/);
      assert.equal(file.relative_path, `driver_util_curves/${file.filename}`);
      assert.equal(file.source_classification, "donor-static-driver-util-mirror");
      assert.equal(file.raw_payload_in_manifest, false);
    }

    assert.equal(manifestText.includes("RAW-DRIVER-UTIL-PAYLOAD-SHOULD-NOT-APPEAR"), false);
    assert.equal(manifestText.includes("ANOTHER-RAW-DRIVER-UTIL-PAYLOAD"), false);
    assert.equal(manifestText.includes('"curve"'), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("driver util curve mirror runner fails closed on differing existing target", async () => {
  const workspace = await makeWorkspace();
  try {
    await mkdir(workspace.target, { recursive: true });
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), '{"source":100}\n', "utf-8");
    await writeFile(path.join(workspace.target, "driver_util_alpha.json"), '{"target":999}\n', "utf-8");

    const result = await runRunner(workspace, ["--execute"]);
    const targetText = await readFile(path.join(workspace.target, "driver_util_alpha.json"), "utf-8");

    assert.equal(result.code, 2);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.blocker, "target-checksum-conflict");
    assert.equal(result.json.conflict_count, 1);
    assert.equal(result.json.copied_count, 0);
    assert.equal(result.json.manifest_written, false);
    assert.equal(targetText, '{"target":999}\n');
    assert.equal(existsSync(workspace.manifest), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("driver util curve mirror runner ignores non-JSON files safely", async () => {
  const workspace = await makeWorkspace();
  try {
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), '{"driver":"A"}\n', "utf-8");
    await writeFile(path.join(workspace.source, "notes.txt"), "not a driver util curve", "utf-8");
    await mkdir(path.join(workspace.source, "nested"));

    const result = await runRunner(workspace, ["--execute"]);
    const targetEntries = await readdir(workspace.target);
    const manifest = JSON.parse(await readFile(workspace.manifest, "utf-8"));

    assert.equal(result.code, 0);
    assert.equal(result.json.ignored_count, 2);
    assert.deepEqual(targetEntries, ["driver_util_alpha.json"]);
    assert.equal(manifest.file_count, 1);
    assert.equal(manifest.files[0].filename, "driver_util_alpha.json");
    assert.equal(JSON.stringify(manifest).includes("notes.txt"), false);
  } finally {
    await cleanupWorkspace(workspace);
  }
});

test("driver util curve mirror runner does not touch novondb.json", async () => {
  const workspace = await makeWorkspace();
  try {
    const activeSnapshot = path.join(workspace.root, "runtime-data", "authority-reference", "novondb.json");
    const snapshotText = JSON.stringify({ sentinel: "do-not-touch" }, null, 2);
    await writeFile(path.join(workspace.source, "driver_util_alpha.json"), '{"driver":"A"}\n', "utf-8");
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

test("driver util curve mirror runner does not import Board Data Maker, invoke donor Engine, or add route surface", async () => {
  const runnerText = await readFile(runnerPath, "utf-8");
  const serverText = await readFile(path.join(repoRoot, "server.js"), "utf-8");
  const importLines = runnerText
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("import ") || line.trim().startsWith("from "))
    .join("\n");

  assert.equal(runnerText.includes("BoardDataMaker"), false);
  assert.equal(importLines.toLowerCase().includes("board"), false);
  assert.equal(importLines.toLowerCase().includes("novondb"), false);
  assert.equal(importLines.toLowerCase().includes("engine"), false);
  assert.equal(runnerText.includes("run_engine"), false);
  assert.equal(serverText.includes("mirror_driver_util_curves_to_runtime"), false);
  assert.equal(serverText.includes("driver_util_curves_manifest"), false);
  assert.equal(serverText.includes("/api/driver"), false);
  assert.equal(serverText.includes("post('/driver"), false);
});
