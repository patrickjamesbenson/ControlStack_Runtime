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

test("host-local Engine evidence runner maps real-source aliases without inventing lighting values", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  for (const alias of [
    "board_capacity_lm_per_m",
    "lumens_per_m",
    "LUMENS_PER_M",
    "output per m",
    "colour_temperature",
    "kelvin",
    "cct_cri",
    "optic_var_1",
    "diffuser_var_1",
    "lens_type",
    "control_protocol",
    "driver_type",
    "efficiency_optical",
    "f_optical",
    "F optical",
  ]) {
    assert.match(runnerText, new RegExp(alias.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")));
  }

  assert.match(runnerText, /normalise_field_name/);
  assert.match(runnerText, /alias_keys\("board_capacity_lm_per_m"\)/);
  assert.match(runnerText, /alias_keys\("cct"\)/);
  assert.match(runnerText, /alias_keys\("cri"\)/);
  assert.match(runnerText, /alias_keys\("optic"\)/);
  assert.match(runnerText, /optic_eff_from_row/);
  assert.match(runnerText, /"opt" in lowered and "eff" in lowered/);
  assert.match(runnerText, /without using the donor bridge/);
  assert.match(runnerText, /safe_schema_introspection/);
  assert.match(runnerText, /"raw_rows_returned": False/);
  assert.match(runnerText, /"raw_headers_returned": False/);
});

test("host-local Engine evidence runner decouples source-backed CCT/CRI from lm/m and reports safe value diagnostics", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /find_lighting_board/);
  assert.equal(runnerText.includes("numeric_token(lm) and normalise_cct(cct) and normalise_cri(cri)"), false);
  assert.match(runnerText, /No approved source-backed BOARDS row with parseable CCT and CRI/);
  assert.match(runnerText, /value_diagnostics/);
  assert.match(runnerText, /value_diagnostic_entry/);
  assert.match(runnerText, /parsed_usable/);
  assert.match(runnerText, /sample_class/);
  assert.match(runnerText, /tunable-white-token/);
  assert.match(runnerText, /kelvin-token/);
  assert.match(runnerText, /Board capacity formula input only; not used as Selector target_lm_per_m/);
  assert.match(runnerText, /Diagnostic only; not used as the controlled Selector\/user target/);
  assert.match(runnerText, /c1_lumen_imax_25c/);
  assert.match(runnerText, /length_mm/);
  assert.match(runnerText, /c1_imax_ma/);
});

test("host-local Engine evidence runner classifies target lm/m as controlled Selector intent", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /CONTROLLED_TARGET_LM_PER_M = 1000/);
  assert.match(runnerText, /CONTROLLED_TARGET_REASON/);
  assert.match(runnerText, /controlled-selector-intent/);
  assert.match(runnerText, /not Board Data/);
  assert.match(runnerText, /not source-backed product output/);
  assert.match(runnerText, /host-local runner controlled Selector\/user intent/);
  assert.match(runnerText, /lighting\["target_lm_per_m"\] = target_lm_per_m/);
  assert.match(runnerText, /lighting\["lm_per_m"\] = target_lm_per_m/);
  assert.match(runnerText, /optional-source-backed-capacity-diagnostic/);
  assert.equal(runnerText.includes('field_map_entry("target_lm_per_m", bool(target_lm_per_m), "source-backed-required"'), false);
});

test("host-local Engine evidence runner passes donor-compatible manual tier strategy and length policy diagnostics", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /ENGINE-RUNTABLE-TIER-LENGTH-POLICY-RESOLUTION-1/);
  assert.match(runnerText, /TIER_STRATEGY_FIELD_SHAPE/);
  assert.match(runnerText, /tier_strategy\.selected_tier/);
  assert.match(runnerText, /tier_strategy\.candidate_tiers/);
  assert.match(runnerText, /tier_strategy_payload/);
  assert.match(runnerText, /\"tier_strategy\": tier_strategy_payload\(tier\)/);
  assert.match(runnerText, /\"mode\": \"manual\"/);
  assert.match(runnerText, /\"optimisation_intent\": \"locked_manual\"/);
  assert.match(runnerText, /tier_length_policy_diagnostics/);
  assert.match(runnerText, /LENGTH_POLICY_DIAGNOSTIC_ITEMS/);
  assert.match(runnerText, /length_pref/);
  assert.match(runnerText, /max_board_gap_mm/);
  assert.match(runnerText, /gap_mode/);
  assert.match(runnerText, /raw_rows_returned\": False/);
  assert.match(runnerText, /raw_values_returned\": False/);
  assert.match(runnerText, /raw_payload_returned\": False/);
  assert.match(runnerText, /tier_length_policy_resolution_after_execute/);
  assert.equal(runnerText.includes("from lib.engine_bridge"), false);
});


test("host-local Engine evidence runner uses donor-compatible controlled run geometry", async () => {
  const runnerText = await readFile(runnerSourceUrl, "utf-8");

  assert.match(runnerText, /CONTROLLED_RUN_LENGTH_MM = 5600/);
  assert.match(runnerText, /CONTROLLED_RUN_GEOMETRY_REASON/);
  assert.match(runnerText, /controlled-test-geometry/);
  assert.match(runnerText, /donor-compatible run-row/);
  assert.match(runnerText, /field shape/);
  assert.match(runnerText, /not product data/);
  assert.match(runnerText, /not source-backed Board Data/);
  assert.match(runnerText, /controlled_geometry_summary/);
  assert.match(runnerText, /donor-selector-seed-5600mm/);

  for (const field of [
    "Run Length (mm)",
    "Required length (mm)",
    "run_length_mm",
    "length_mm",
    "lengthMm",
    "lengthMode",
    "requested_length_basis",
    "length_policy_source",
    "accessory_length_policy_source",
  ]) {
    assert.equal(runnerText.includes(field), true);
  }
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
