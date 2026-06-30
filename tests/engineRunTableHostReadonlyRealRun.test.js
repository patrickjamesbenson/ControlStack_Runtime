import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runnerSourceUrl = new URL("../tools/evidence/engine_runtable_host_readonly_real_run.py", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

test("host-local Engine evidence runner imports the internal seam directly and defaults to preflight", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /engine_runtable_internal_readonly_invoke_probe/);
  assert.match(runnerText, /_load_runtime_data_active_source_internal/);
  assert.match(runnerText, /MCP_SOURCE_PATH/);
  assert.match(runnerText, /mode = "preflight"/);
  assert.match(runnerText, /--preflight/);
  assert.match(runnerText, /--derive-candidate/);
  assert.match(runnerText, /--execute/);
  assert.match(runnerText, /if args\.execute:/);
});

test("host-local Engine evidence runner is route-free, POST-free, and avoids donor bridge", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.match(runnerText, /"host_local_only": True/);
  assert.match(runnerText, /"public_route_added": False/);
  assert.match(runnerText, /"post_endpoint_added": False/);
  assert.match(runnerText, /"donor_bridge_used": False/);
  assert.match(runnerText, /"audit_jsonl_write_attempted": False/);
  assert.equal(runnerText.includes("from lib.engine_bridge"), false);
  assert.equal(runnerText.includes("engine_run_response"), false);
  assert.equal(runnerText.includes("webhook_post("), false);
  assert.equal(runnerText.includes("/api/engine/run"), false);
  assert.equal(runnerText.includes("/api/selector/run"), false);
  assert.equal(runnerText.includes("router.post"), false);
  assert.equal(runnerText.includes("add_route"), false);

  assert.equal(serverText.includes("engine_runtable_host_readonly_real_run"), false);
  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
});

test("host-local Engine evidence runner refuses caller supplied db/path/payload inputs", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /DISALLOWED_ARG_PREFIXES/);
  assert.match(runnerText, /--db/);
  assert.match(runnerText, /--source-db/);
  assert.match(runnerText, /--runtime-data-path/);
  assert.match(runnerText, /--selector-payload/);
  assert.match(runnerText, /caller-supplied-source-or-payload-refused/);
  assert.match(runnerText, /caller_supplied_db_allowed/);
  assert.equal(runnerText.includes("add_argument(\"--db"), false);
  assert.equal(runnerText.includes("add_argument('--db"), false);
});

test("host-local Engine evidence runner does not serialise raw source rows, USERS rows, or private payloads", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  for (const flag of [
    "raw_rows_exposed",
    "raw_headers_exposed",
    "raw_users_exposed",
    "raw_user_headers_exposed",
    "raw_snapshot_returned",
    "raw_snapshot_serialized",
    "raw_engine_payload_exposed",
    "raw_engine_debug_payload_exposed",
    "raw_rough_electrical_payload_exposed",
    "credentials_exposed",
    "provider_ids_exposed",
    "private_paths_exposed",
    "source_path_returned",
  ]) {
    assert.match(runnerText, new RegExp(`"${flag}": False`));
  }

  assert.match(runnerText, /"candidate_payload_serialized": False/);
  assert.match(runnerText, /"candidate_payload_returned": False/);
  assert.match(runnerText, /candidate_private_values_redacted_in_report/);
  assert.match(runnerText, /if key != "selector_payload"/);
  assert.equal(runnerText.includes("print(snapshot"), false);
  assert.equal(runnerText.includes("json.dumps(snapshot"), false);
  assert.equal(runnerText.includes("print(selector_payload"), false);
  assert.equal(runnerText.includes("json.dumps(selector_payload"), false);
});

test("host-local Engine evidence runner fails closed for missing candidate fields and writes only ignored reports", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  for (const field of ["tier", "runs", "lighting", "target_lm_per_m", "cct", "cri", "optic", "control_type"]) {
    assert.match(runnerText, new RegExp(`missing-candidate-field-\\{required_field\\}`));
    assert.match(runnerText, new RegExp(`"${field}"`));
  }

  assert.match(runnerText, /REPORT_DIR = RUNTIME_ROOT \/ "_worker_reports"/);
  assert.match(runnerText, /STAGE_REPORT_PATH/);
  assert.match(runnerText, /LATEST_REPORT_PATH/);
  assert.match(runnerText, /"product_data_invented": False/);
  assert.match(runnerText, /"synthetic success"|synthetic/i);
  assert.equal(runnerText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(runnerText.includes("write_text(text"), true);
});
