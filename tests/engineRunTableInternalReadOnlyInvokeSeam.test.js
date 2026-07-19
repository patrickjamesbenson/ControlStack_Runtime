import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mcpSourceUrl = new URL("../tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);
const donorBridgeUrl = new URL("../../ControlStack/lib/engine_bridge/service.py", import.meta.url);
const donorRunEngineUrl = new URL("../../ControlStack/lib/planning/run_engine.py", import.meta.url);

function balanced(text, open, close) {
  return (text.match(new RegExp(open, "g")) || []).length === (text.match(new RegExp(close, "g")) || []).length;
}

test("internal read-only Engine invocation seam is MCP-only and route-free", async () => {
  const mcpText = await readFile(mcpSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.match(mcpText, /def engine_runtable_internal_readonly_invoke_probe\(/);
  assert.match(mcpText, /internal_mcp_diagnostic_only/);
  assert.match(mcpText, /public_route_added["']:\s*False/);
  assert.match(mcpText, /post_endpoint_added["']:\s*False/);
  assert.match(mcpText, /caller_supplied_file_path_allowed["']:\s*False/);
  assert.match(mcpText, /caller_supplied_db_allowed["']:\s*False/);
  assert.match(mcpText, /engine_runtable_internal_readonly_invoke_probe_available/);

  assert.equal(serverText.includes("engine_runtable_internal_readonly_invoke_probe"), false);
  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("/api/selected-result"), false);
});

test("internal seam loads active source internally and never emits raw rows or USERS rows", async () => {
  const mcpText = await readFile(mcpSourceUrl, "utf-8");

  assert.match(mcpText, /def _load_runtime_data_active_source_internal\(/);
  assert.match(mcpText, /RUNTIMEDATA_ACTIVE_SOURCE_PATH/);
  assert.match(mcpText, /payload\["db"\]\s*=\s*snapshot/);
  assert.match(mcpText, /active_source_db_passed_in_memory_only/);
  assert.match(mcpText, /raw_rows_exposed["']:\s*False/);
  assert.match(mcpText, /raw_users_exposed["']:\s*False/);
  assert.match(mcpText, /raw_snapshot_returned["']:\s*False/);
  assert.match(mcpText, /raw_snapshot_serialized["']:\s*False/);
  assert.match(mcpText, /raw_engine_payload_exposed["']:\s*False/);
  assert.match(mcpText, /raw_rough_electrical_payload_exposed["']:\s*False/);
  assert.match(mcpText, /credentials_exposed["']:\s*False/);
  assert.match(mcpText, /provider_ids_exposed["']:\s*False/);
  assert.match(mcpText, /private_paths_exposed["']:\s*False/);
  assert.match(mcpText, /source_path_returned["']:\s*False/);
});

test("internal seam avoids donor bridge and audit JSONL writes", async () => {
  const mcpText = await readFile(mcpSourceUrl, "utf-8");
  const bridgeText = await readFile(donorBridgeUrl, "utf-8");
  const runEngineText = await readFile(donorRunEngineUrl, "utf-8");

  assert.match(bridgeText, /audit_dir\s*=\s*_repo_root\(\)\s*\/\s*["']data["']\s*\/\s*["']engine_run_audit["']/);
  assert.match(bridgeText, /audit_path\.open\(["']a["']/);
  assert.equal(mcpText.includes("from lib.engine_bridge"), false);
  assert.equal(mcpText.includes("engine_run_response"), false);
  assert.match(mcpText, /from lib\.planning\.run_engine import run_engine/);
  assert.match(mcpText, /donor_bridge_used["']:\s*False/);
  assert.match(mcpText, /audit_jsonl_write_attempted["']:\s*False/);
  assert.match(mcpText, /Direct donor run_engine was invoked without donor bridge or audit JSONL write/);

  assert.equal(/\.open\(["']a["']/.test(runEngineText), false);
  assert.equal(/write_text\(|mkdir\(|to_csv\(|to_json\(/.test(runEngineText), false);
  assert.equal(balanced(mcpText, "\\{", "\\}"), true);
});

test("internal seam fails closed for incomplete candidates and does not create synthetic selected results", async () => {
  const mcpText = await readFile(mcpSourceUrl, "utf-8");

  for (const field of ["tier", "runs", "lighting", "target_lm_per_m", "cct", "cri", "optic", "control_type"]) {
    assert.match(mcpText, new RegExp(`missing-candidate-field-\\{item\\['field'\\]\\}`));
  }

  assert.match(mcpText, /caller-supplied-db-refused/);
  assert.match(mcpText, /execute-flag-not-set/);
  assert.match(mcpText, /selected_result_created["']:\s*False/);
  assert.match(mcpText, /synthetic_success_fixture_created["']:\s*False/);
  assert.match(mcpText, /product_data_invented["']:\s*False/);
  assert.match(mcpText, /selected_result_persistence_enabled["']:\s*False/);
  assert.match(mcpText, /engine_result_produced=bool\(safe_summary\.get\("success"\)\)/);
});

test("internal seam safe summary preserves manual-path selected tier diagnostics", async () => {
  const mcpText = await readFile(mcpSourceUrl, "utf-8");

  assert.match(mcpText, /rough_payload = engine_result\.get\("rough_electrical_payload"\)/);
  assert.match(mcpText, /policy_sources = debug\.get\("policy_sources"\)/);
  assert.match(mcpText, /rough_payload\.get\("tier"\)/);
  assert.match(mcpText, /policy_sources\.get\("tier"\)/);
  assert.match(mcpText, /"selected_tier": str\(selected_tier\)\[:80\]/);
  assert.match(mcpText, /raw_result_returned["']:\s*False/);
  assert.match(mcpText, /raw_debug_returned["']:\s*False/);
  assert.match(mcpText, /raw_rough_electrical_payload_returned["']:\s*False/);
});
