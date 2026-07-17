import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const LAB_ROOT = "C:\\ControlStack_Worktrees\\code-pilot-lab";
const REQUIRED_BRANCH = "lane/code-pilot-lab";
const REQUIRED_BASE = "c4ab11e09e2469e43b84d507890fe802a9ebb85b";
const MESSAGE = "docs(lab): establish durable lane memory";
const PYTHON = "C:\\Users\\Patrick\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";
const GATE_RUNNER = "C:\\ControlStack_Worktrees\\controlstack-tooling-v2\\scripts\\controlstack_lane_gate.py";
const RECEIPT_ROOT = "C:\\ControlStack_Receipts";

const EXPECTED = {
  "modified": [
    "packages/lab-kernel/ies-toolkit/iesApproval.js",
    "packages/lab-kernel/ies-toolkit/iesHandoff.js",
    "packages/lab-kernel/ies-toolkit/iesLabForm.js",
    "packages/lab-kernel/ies-toolkit/iesMetrics.js",
    "packages/lab-kernel/ies-toolkit/iesProvenance.js",
    "packages/lab-kernel/ies-toolkit/iesWrite.js",
    "packages/lab-kernel/ies-toolkit/summary.html",
    "tests/lab-kernel/iesGovernance.test.js",
    "tests/lab-kernel/iesHandoff.test.js",
    "tests/lab-kernel/iesLabForm.test.js"
  ],
  "staged": [
    "docs/_context/lanes/lab-ies/DECISION_LOG.md",
    "docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md",
    "docs/_context/lanes/lab-ies/LANE_CHARTER.md",
    "docs/_context/lanes/lab-ies/LANE_STATE.md",
    "docs/_context/lanes/lab-ies/SESSION_HANDOFF.md",
    "docs/_context/lanes/lab-ies/WORK_QUEUE.md"
  ],
  "untracked": [
    "README.zip",
    "docs/_context/ControlStack_summary_normalise_harness_spec.md",
    "packages/lab-kernel/ies-toolkit/bench.html",
    "packages/lab-kernel/ies-toolkit/component_library.html",
    "packages/lab-kernel/ies-toolkit/curator.html",
    "packages/lab-kernel/ies-toolkit/docRegister.js",
    "packages/lab-kernel/ies-toolkit/docs.html",
    "packages/lab-kernel/ies-toolkit/emergency.html",
    "packages/lab-kernel/ies-toolkit/equipment_register.html",
    "packages/lab-kernel/ies-toolkit/extended_report.html",
    "packages/lab-kernel/ies-toolkit/iesAuthorityFingerprint.js",
    "packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js",
    "packages/lab-kernel/ies-toolkit/iesCanonicalJson.js",
    "packages/lab-kernel/ies-toolkit/iesFromReference.js",
    "packages/lab-kernel/ies-toolkit/iesGuards.js",
    "packages/lab-kernel/ies-toolkit/iesKeywordContract.js",
    "packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js",
    "packages/lab-kernel/ies-toolkit/iesMerge.js",
    "packages/lab-kernel/ies-toolkit/iesNormaliseController.js",
    "packages/lab-kernel/ies-toolkit/iesPolar.js",
    "packages/lab-kernel/ies-toolkit/iesProjectIes.js",
    "packages/lab-kernel/ies-toolkit/iesReferenceDto.js",
    "packages/lab-kernel/ies-toolkit/iesSymmetrize.js",
    "packages/lab-kernel/ies-toolkit/iesTransforms.js",
    "packages/lab-kernel/ies-toolkit/iesUgr.js",
    "packages/lab-kernel/ies-toolkit/iesUgrCie190.js",
    "packages/lab-kernel/ies-toolkit/iesWorkingRecord.js",
    "packages/lab-kernel/ies-toolkit/ies_builder.html",
    "packages/lab-kernel/ies-toolkit/ies_merge.html",
    "packages/lab-kernel/ies-toolkit/index.html",
    "packages/lab-kernel/ies-toolkit/lab.css",
    "packages/lab-kernel/ies-toolkit/lab.html",
    "packages/lab-kernel/ies-toolkit/lab/",
    "packages/lab-kernel/ies-toolkit/lab_request.html",
    "packages/lab-kernel/ies-toolkit/labbench.html",
    "packages/lab-kernel/ies-toolkit/luminaire_provenance.html",
    "packages/lab-kernel/ies-toolkit/nvb/",
    "packages/lab-kernel/ies-toolkit/nvbComponents.js",
    "packages/lab-kernel/ies-toolkit/nvbLabAdapter.js",
    "packages/lab-kernel/ies-toolkit/nvbReference.js",
    "packages/lab-kernel/ies-toolkit/nvbResolve.js",
    "packages/lab-kernel/ies-toolkit/onemm_contract.html",
    "packages/lab-kernel/ies-toolkit/provenance.html",
    "packages/lab-kernel/ies-toolkit/provenance_explorer.html",
    "packages/lab-kernel/ies-toolkit/reference_builder.html",
    "packages/lab-kernel/ies-toolkit/selector_stub.html",
    "packages/lab-kernel/ies-toolkit/test_request.html",
    "packages/lab-kernel/ies-toolkit/ugr.html",
    "packages/lab-kernel/ies-toolkit/zencontrolEmergency.js",
    "scripts/clear_chaff.ps1",
    "serve.mjs",
    "tests/lab-kernel/iesAuthorityFingerprint.test.js",
    "tests/lab-kernel/iesAuthorityRecord.test.js",
    "tests/lab-kernel/iesCanonicalJson.test.js",
    "tests/lab-kernel/iesFromReference.test.js",
    "tests/lab-kernel/iesGuards.test.js",
    "tests/lab-kernel/iesKeywordContract.test.js",
    "tests/lab-kernel/iesKeywordMigration.test.js",
    "tests/lab-kernel/iesLabFormKeywords.test.js",
    "tests/lab-kernel/iesNormaliseController.test.js",
    "tests/lab-kernel/iesProjectIes.test.js",
    "tests/lab-kernel/iesReferenceDto.test.js",
    "tests/lab-kernel/iesTransforms.test.js",
    "tests/lab-kernel/iesUgr.test.js",
    "tests/lab-kernel/iesUgrCie190.test.js",
    "tests/lab-kernel/iesWorkingRecord.test.js"
  ],
  "deleted": []
};

function git(args, options = {}) {
  const { preserveLeading = false, ...execOptions } = options;
  const result = execFileSync("git.exe", ["-C", LAB_ROOT, ...args], {
    encoding: "utf8",
    windowsHide: true,
    ...execOptions,
  });
  if (typeof result !== "string") return "";
  return preserveLeading ? result.replace(/\r?\n$/, "") : result.trim();
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function equal(label, actual, expected) {
  const a = JSON.stringify(sorted(actual));
  const e = JSON.stringify(sorted(expected));
  if (a !== e) throw new Error(label + " changed; refusing to checkpoint.\nActual: " + a + "\nExpected: " + e);
}

function gitState() {
  const state = { staged: [], modified: [], untracked: [], deleted: [] };
  const raw = git(["status", "--porcelain=v1", "--untracked-files=normal"], { preserveLeading: true });
  for (const line of raw ? raw.split(/\r?\n/) : []) {
    const x = line[0];
    const y = line[1];
    const file = line.slice(3);
    if (!file || file.includes(" -> ")) throw new Error("Unexpected Git status entry: " + line);
    if (x === "?" && y === "?") {
      state.untracked.push(file);
      continue;
    }
    if (x !== " ") state.staged.push(file);
    if (y === "M") state.modified.push(file);
    if (x === "D" || y === "D") state.deleted.push(file);
  }
  for (const key of Object.keys(state)) state[key] = sorted(state[key]);
  return state;
}

function verifyInitialState(state) {
  equal("Staged documentation set", state.staged, EXPECTED.staged);
  equal("Protected modified IES set", state.modified, EXPECTED.modified);
  equal("Protected untracked IES set", state.untracked, EXPECTED.untracked);
  equal("Deleted set", state.deleted, EXPECTED.deleted);
}

function verifyProtectedAfterCommit(state) {
  equal("Post-commit staged set", state.staged, []);
  equal("Protected modified IES set", state.modified, EXPECTED.modified);
  equal("Protected untracked IES set", state.untracked, EXPECTED.untracked);
  equal("Deleted set", state.deleted, EXPECTED.deleted);
}

function runGate() {
  const result = spawnSync(PYTHON, [GATE_RUNNER, "lab-ies", "--root", LAB_ROOT, "--required-branch", REQUIRED_BRANCH], {
    stdio: "inherit",
    windowsHide: false,
  });
  if (result.status !== 0) throw new Error("lab-ies gate failed; no commit was created.");
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function writeReceipt(commit, mode) {
  mkdirSync(RECEIPT_ROOT, { recursive: true });
  const receipt = {
    schema: "controlstack-lab-memory-checkpoint/1",
    status: "committed-gated-pushed",
    mode,
    completedAt: new Date().toISOString(),
    root: LAB_ROOT,
    branch: REQUIRED_BRANCH,
    commit,
    message: MESSAGE,
    gate: { name: "lab-ies", passed: true },
    committedPaths: EXPECTED.staged,
    protectedInventory: {
      modifiedCount: EXPECTED.modified.length,
      untrackedCount: EXPECTED.untracked.length,
      deletedCount: EXPECTED.deleted.length,
      unchanged: true,
    },
    destructiveOperationsUsed: false,
    featureFilesCommitted: false,
  };
  const receiptPath = path.join(RECEIPT_ROOT, "CONTROLSTACK_LAB_MEMORY_CHECKPOINT_" + stamp() + ".json");
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
  console.log("LAB MEMORY CHECKPOINT: PASS");
  console.log("Commit: " + commit);
  console.log("Receipt: " + receiptPath);
}

function currentCommitIsCheckpoint() {
  if (git(["log", "-1", "--format=%s"]) !== MESSAGE) return false;
  const committed = git(["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"]);
  equal("Existing checkpoint commit paths", committed ? committed.split(/\r?\n/) : [], EXPECTED.staged);
  return true;
}

function main() {
  if (process.platform !== "win32") throw new Error("This checkpoint runs only on Patrick's Windows host.");
  if (os.hostname().toLowerCase() !== "pb-surface-pro") throw new Error("Wrong Windows host.");
  if (os.userInfo().username.toLowerCase() !== "patrick") throw new Error("Wrong Windows user.");
  if (git(["branch", "--show-current"]) !== REQUIRED_BRANCH) throw new Error("Wrong Lab branch.");

  const head = git(["rev-parse", "HEAD"]);
  if (head !== REQUIRED_BASE) {
    if (!currentCommitIsCheckpoint()) throw new Error("Unexpected Lab HEAD; refusing to checkpoint.");
    const state = gitState();
    verifyProtectedAfterCommit(state);
    git(["push", "-u", "origin", REQUIRED_BRANCH], { stdio: "inherit" });
    writeReceipt(head, "existing-checkpoint-pushed");
    return;
  }

  const before = gitState();
  verifyInitialState(before);
  runGate();
  verifyInitialState(gitState());

  git(["commit", "-m", MESSAGE], { stdio: "inherit" });
  const commit = git(["rev-parse", "HEAD"]);
  if (commit === REQUIRED_BASE) throw new Error("Commit was not created.");

  const committed = git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit]);
  equal("Committed paths", committed ? committed.split(/\r?\n/) : [], EXPECTED.staged);
  verifyProtectedAfterCommit(gitState());

  git(["push", "-u", "origin", REQUIRED_BRANCH], { stdio: "inherit" });
  verifyProtectedAfterCommit(gitState());
  writeReceipt(commit, "new-checkpoint");
}

try {
  main();
} catch (error) {
  console.error("LAB MEMORY CHECKPOINT FAILED: " + (error?.message || "unknown error"));
  process.exitCode = 1;
}
