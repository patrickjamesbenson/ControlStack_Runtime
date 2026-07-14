import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_LIVE_READONLY_INVOKE_LIFECYCLE_AND_NO_WRITE_LOCK_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";

const runtimeRoot = fileURLToPath(new URL("../", import.meta.url));
const hostAdapterPath = fileURLToPath(
  new URL("../tools/runtime/engine_runtable_selected_project_readonly_host_adapter.py", import.meta.url),
);
const mcpSourcePath = fileURLToPath(
  new URL("../tools/controlstack-mcp/controlstack_mcp.py", import.meta.url),
);

function invokePythonJson(args, stdin = null) {
  return new Promise((resolve, reject) => {
    const command = String(process.env.CONTROLSTACK_PYTHON || "python").trim() || "python";
    const child = spawn(command, args, {
      cwd: runtimeRoot,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        CONTROLSTACK_RUNTIME_ROOT: runtimeRoot,
        PYTHONDONTWRITEBYTECODE: "1",
      },
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("readonly-python-probe-timeout"));
    }, 120000);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`readonly-python-probe-exit-${code}:${stderr.slice(0, 120)}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("readonly-python-probe-json-invalid"));
      }
    });
    child.stdin.end(stdin === null ? undefined : stdin);
  });
}

function invokeLiveHostAdapter(request) {
  return invokePythonJson(["-B", hostAdapterPath], JSON.stringify(request));
}

test("locks the live server lifecycle to string revisions while leaving the disabled browser client on the prior fail-closed response contract", async () => {
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_LIVE_READONLY_INVOKE_LIFECYCLE_AND_NO_WRITE_LOCK_ID,
    "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-LIVE-READONLY-INVOKE-LIFECYCLE-AND-NO-WRITE-LOCK-1",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER.length
      > RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER.length,
    true,
  );
  for (const key of [
    "serverOwnedRevisionChecked",
    "inFlightInvocationBlocked",
    "invocationConsumed",
    "replayBlocked",
    "staleServerRevisionBlocked",
    "secondServerOwnedEnvelopeRevisionCheckPassed",
    "activeRuntimeDataLoadedReadOnly",
    "activeRuntimeDataPassedInMemoryOnly",
    "donorRunEngineAttempted",
    "donorBridgeUsed",
    "filesystemWriteGuardActive",
    "filesystemWriteAttempted",
    "auditJsonlWriteAttempted",
    "runtimeDataMutated",
    "selectedResultPersisted",
    "runTableGenerated",
    "iesGenerated",
    "outputGenerated",
  ]) {
    assert.equal(
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER
        .includes(key),
      true,
      key,
    );
    assert.equal(
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER.includes(key),
      false,
      `disabled-browser-contract:${key}`,
    );
  }

  const [transportSource, capabilitySource, mountSource, adapterSource, mcpSource, serverSource] =
    await Promise.all([
      readFile(new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js",
        import.meta.url,
      ), "utf8"),
      readFile(new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js",
        import.meta.url,
      ), "utf8"),
      readFile(new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js",
        import.meta.url,
      ), "utf8"),
      readFile(new URL(
        "../tools/runtime/engine_runtable_selected_project_readonly_host_adapter.py",
        import.meta.url,
      ), "utf8"),
      readFile(new URL("../tools/controlstack-mcp/controlstack_mcp.py", import.meta.url), "utf8"),
      readFile(new URL("../server.js", import.meta.url), "utf8"),
    ]);

  assert.match(transportSource, /const IN_FLIGHT_SERVER_REVISION_IDS = new Set\(\)/);
  assert.match(transportSource, /const CONSUMED_SERVER_REVISION_IDS = new Set\(\)/);
  assert.match(transportSource, /getActiveRevision/);
  assert.match(transportSource, /serverRevisionId/);
  assert.match(transportSource, /verifyCurrentEnvelopeRevision/);
  assert.match(transportSource, /privateEnvelopeFingerprint\(currentEnvelope\)/);
  assert.match(transportSource, /selected-project-readonly-invoke-stale-server-owned-revision-blocked/);
  assert.match(capabilitySource, /filesystemWriteGuardRequired: true/);
  assert.match(capabilitySource, /bytecodeWritingDisabled: true/);
  assert.match(mountSource, /filesystemWriteGuardRequired: true/);
  assert.match(mountSource, /bytecodeWritingDisabled: true/);
  assert.match(adapterSource, /sys\.dont_write_bytecode = True/);
  assert.match(adapterSource, /PYTHONDONTWRITEBYTECODE/);
  assert.match(mcpSource, /def _deny_engine_filesystem_writes\(\)/);
  assert.match(mcpSource, /patch\(builtins, "open", guarded_builtin_open\)/);
  assert.match(mcpSource, /patch\(io, "open", guarded_io_open\)/);
  assert.match(mcpSource, /patch\(os, "open", guarded_os_open\)/);
  assert.match(mcpSource, /"mkdir", "makedirs", "remove", "unlink", "rename", "replace"/);
  assert.match(mcpSource, /"write_text", "write_bytes", "touch", "mkdir", "unlink", "rename"/);
  assert.match(mcpSource, /patch\(shutil, name, blocked_path_operation/);
  assert.match(mcpSource, /patch\(tempfile, name, blocked_path_operation/);
  assert.match(mcpSource, /patch\(sqlite3, "connect", blocked_path_operation/);
  assert.match(mcpSource, /patch\(subprocess, "Popen", blocked_path_operation/);
  assert.match(mcpSource, /snapshot_before = copy\.deepcopy\(snapshot\)/);
  assert.match(mcpSource, /runtime_data_mutated = snapshot != snapshot_before/);
  assert.match(serverSource, /\["-B", SELECTED_PROJECT_ENGINE_READONLY_HOST_ADAPTER_PATH\]/);
  assert.match(serverSource, /PYTHONDONTWRITEBYTECODE: "1"/);
});

test("a donor audit JSONL write attempt is intercepted and returned as a redacted fail-closed safety result", async () => {
  const targetPath = resolve(
    runtimeRoot,
    `.readonly-engine-write-guard-${process.pid}-${Date.now()}.audit.jsonl`,
  );
  const pythonSource = String.raw`
import importlib.util
import json
import sys
import types
from pathlib import Path

mcp_path = Path(sys.argv[1])
target_path = Path(sys.argv[2])
spec = importlib.util.spec_from_file_location("controlstack_readonly_write_guard_probe", mcp_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

lib_module = types.ModuleType("lib")
lib_module.__path__ = []
planning_module = types.ModuleType("lib.planning")
planning_module.__path__ = []
run_engine_module = types.ModuleType("lib.planning.run_engine")

def run_engine(_payload):
    with target_path.open("a", encoding="utf-8") as handle:
        handle.write("{}\\n")
    return {"success": True}

run_engine_module.run_engine = run_engine
sys.modules["lib"] = lib_module
sys.modules["lib.planning"] = planning_module
sys.modules["lib.planning.run_engine"] = run_engine_module

result = module.engine_runtable_internal_readonly_invoke_probe(
    selector_payload={
        "host_local_readonly_engine_candidate": True,
        "selector_stage3_supported_subset": True,
        "tier": "Business",
        "runs": [{"qty": 1, "run_length_mm": 3500, "length_mode": "cut_to_length"}],
        "optic": {"key": "80|Inlay", "label": "Inlay"},
        "lighting": {
            "target_lm_per_m": "1200",
            "cct": "4000",
            "cri": "90",
            "opticKey": "80|Inlay",
            "control_type": "DALI-2",
        },
    },
    execute=True,
)
print(json.dumps({
    "ok": result.get("ok"),
    "blocker": (result.get("blockers") or [{}])[0].get("code"),
    "active_loaded": result.get("active_source_db_loaded_read_only"),
    "active_passed": result.get("active_source_db_passed_in_memory_only"),
    "donor_attempted": result.get("donor_run_engine_attempted"),
    "guard_active": result.get("filesystem_write_guard_active"),
    "write_attempted": result.get("filesystem_write_attempted"),
    "audit_attempted": result.get("audit_jsonl_write_attempted"),
    "runtime_data_mutated": result.get("runtime_data_mutated"),
    "selected_result_persisted": result.get("selected_result_persisted"),
    "run_table_generated": result.get("run_table_generated"),
    "ies_generated": result.get("ies_generated"),
    "output_generated": result.get("output_generated"),
    "target_exists": target_path.exists(),
}, separators=(",", ":")))
`;

  const result = await invokePythonJson([
    "-B",
    "-c",
    pythonSource,
    mcpSourcePath,
    targetPath,
  ]);

  assert.deepEqual(result, {
    ok: false,
    blocker: "filesystem-write-attempt-blocked",
    active_loaded: true,
    active_passed: true,
    donor_attempted: true,
    guard_active: true,
    write_attempted: true,
    audit_attempted: true,
    runtime_data_mutated: false,
    selected_result_persisted: false,
    run_table_generated: false,
    ies_generated: false,
    output_generated: false,
    target_exists: false,
  });
});

test("live active RuntimeData reaches donor run_engine only in memory under the enforceable no-write guard", async () => {
  const result = await invokeLiveHostAdapter({
    schemaId: "controlstack.runtime.engine-runtable.selected-project-host-seam-bridge.v1",
    schemaVersion: 1,
    selectorPayload: {
      host_local_readonly_engine_candidate: true,
      selector_stage3_supported_subset: true,
      tier: "Business",
      runs: [{ qty: 2, run_length_mm: 3500, length_mode: "cut_to_length" }],
      optic: { key: "80|Inlay", label: "Inlay" },
      lighting: {
        target_lm_per_m: "1200",
        cct: "4000",
        cri: "90",
        optic: "80|Inlay",
        control_type: "DALI-2",
      },
    },
    execute: true,
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
  });

  assert.equal(result.internal_mcp_diagnostic_only, true);
  assert.equal(result.server_side_only, true);
  assert.equal(result.active_source_db_loaded_read_only, true);
  assert.equal(result.active_source_db_passed_in_memory_only, true);
  assert.equal(result.donor_run_engine_attempted, true);
  assert.equal(result.engine_execution_attempted, true);
  assert.equal(result.donor_bridge_used, false);
  assert.equal(result.filesystem_write_guard_active, true);
  assert.equal(result.bytecode_writing_disabled, true);
  assert.equal(result.filesystem_write_attempted, false);
  assert.equal(result.write_attempted, false);
  assert.equal(result.audit_jsonl_write_attempted, false);
  assert.equal(result.runtime_data_mutated, false);
  assert.equal(result.selected_result_persisted, false);
  assert.equal(result.run_table_generated, false);
  assert.equal(result.ies_generated, false);
  assert.equal(result.output_generated, false);
  assert.equal(result.caller_supplied_file_path_allowed, false);
  assert.equal(result.caller_supplied_db_allowed, false);
  assert.equal(result.raw_rows_exposed, false);
  assert.equal(result.raw_engine_payload_exposed, false);
  assert.equal(result.raw_engine_debug_payload_exposed, false);
  assert.equal(result.raw_ies_exposed, false);
  assert.equal(result.private_paths_exposed, false);
  assert.equal(result.source_path_returned, false);
  if (result.ok === false) {
    assert.equal(
      Array.isArray(result.blockers)
        && result.blockers.some((blocker) => blocker?.code === "direct-run-engine-no-success"),
      true,
    );
  }
});
