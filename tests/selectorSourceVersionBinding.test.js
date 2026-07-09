import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import {
  resolveSelectorReferenceOptionsStatus,
  selectorConstraintFingerprintFromQuery,
  selectorReferenceOptionsResponseIsCurrent,
} from "../packages/modules/cs-selector/index.js";

const SOURCE_INPUT_V1 = "safe-source-input-fp-v1";
const SOURCE_INPUT_V2 = "safe-source-input-fp-v2";
const BOARD_VERSION_V1 = "safe-board-data-version-v1";
const BOARD_VERSION_V2 = "safe-board-data-version-v2";

function sourceReady(sourceInputFingerprint = SOURCE_INPUT_V1, boardDataSourceVersion = BOARD_VERSION_V1) {
  return {
    label: "runtime-authority-reference-active-snapshot",
    present: true,
    readable: true,
    parseable: true,
    sourceInputFingerprint,
    boardDataSourceVersion,
  };
}

function snapshot({ cctCri = "3000K / CRI80", metadata = {} } = {}) {
  return {
    metadata,
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct", approved: "yes" },
    ],
    BOARDS: [
      { board: "B1", cct_cri: cctCri, approved: "yes" },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", native_control_type: "DALI-2", approved: "yes" },
    ],
  };
}

function field(result, fieldKey) {
  const found = result.fields.find((item) => item.fieldKey === fieldKey);
  assert.ok(found, `expected ${fieldKey} field`);
  return found;
}

function option(result, fieldKey, value) {
  const found = field(result, fieldKey).options.find((item) => item.value === value);
  assert.ok(found, `expected ${fieldKey} option ${value}`);
  return found;
}

function adapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    isFlagEnabled() { return false; },
    readSnapshots() {
      return {
        route: "/selector",
        diagnostics: {},
        flags: { owner: "test", values: {} },
        project: { currentProject: {}, metadata: {}, selection: {} },
        visibility: { moduleReasons: {}, inputs: {}, visibleModules: [], hiddenModules: [] },
        handoff: {},
        identity: { currentUser: {} },
        authority: {},
        company: {},
        crm: {},
        timelinePolicy: {},
      };
    },
  };
}

test("selector options and fields are bound to source input fingerprint and board data source version", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot(), {
    source: sourceReady(SOURCE_INPUT_V1, BOARD_VERSION_V1),
  });
  const cctCri = field(result, "cctCri");
  const pair = option(result, "cctCri", "cct_cri:3000K|CRI80");

  assert.equal(result.sourceInputFingerprint, SOURCE_INPUT_V1);
  assert.equal(result.boardDataSourceVersion, BOARD_VERSION_V1);
  assert.equal(result.sourceVersionBinding.bindingStatus, "source-version-bound");
  assert.equal(result.sourceVersionBinding.staleRevalidationEnabled, true);
  assert.equal(result.sourceVersionBinding.staleValuesInsertedIntoOptions, false);

  assert.equal(cctCri.sourceInputFingerprint, SOURCE_INPUT_V1);
  assert.equal(cctCri.boardDataSourceVersion, BOARD_VERSION_V1);
  assert.equal(cctCri.sourceVersionBinding.selectedValuesBound, true);
  assert.equal(pair.sourceInputFingerprint, SOURCE_INPUT_V1);
  assert.equal(pair.boardDataSourceVersion, BOARD_VERSION_V1);
  assert.equal(pair.sourceVersionBinding.optionSetsBound, true);
  assert.equal(pair.valueStatus, "source_valid");
  assert.equal(pair.canonicalSourceValue, true);
});

test("stale selected values revalidate as diagnostic_unmapped and are not inserted into fresh options", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot({ cctCri: "4000K / CRI90" }), {
    source: sourceReady(SOURCE_INPUT_V2, BOARD_VERSION_V2),
    constraints: { cctCri: "cct_cri:3000K|CRI80" },
  });
  const cctCri = field(result, "cctCri");

  assert.deepEqual(cctCri.options.map((item) => item.value), ["cct_cri:4000K|CRI90"]);
  assert.equal(cctCri.options.some((item) => item.value === "cct_cri:3000K|CRI80"), false);
  assert.equal(cctCri.selectedValueStatus, "diagnostic_unmapped");
  assert.equal(cctCri.selectedValueDiagnostic.value, "cct_cri:3000K|CRI80");
  assert.equal(cctCri.selectedValueDiagnostic.sourceInputFingerprint, SOURCE_INPUT_V2);
  assert.equal(cctCri.selectedValueDiagnostic.boardDataSourceVersion, BOARD_VERSION_V2);
  assert.equal(result.blockedItems.some((item) => item.fieldKey === "cctCri" && item.status === "diagnostic_unmapped"), true);
});

test("same constraint fingerprint does not silently reuse fields across source-version changes", () => {
  const fingerprint = selectorConstraintFingerprintFromQuery("");
  const previousPayload = deriveSelectorReferenceOptionsFromSnapshot(snapshot(), {
    source: sourceReady(SOURCE_INPUT_V1, BOARD_VERSION_V1),
  });
  const previousLoaded = resolveSelectorReferenceOptionsStatus({}, {
    ...previousPayload,
    ok: true,
    status: "loaded",
    constraintFingerprint: fingerprint,
  }, fingerprint, "");

  const resynced = resolveSelectorReferenceOptionsStatus(previousLoaded, {
    ok: true,
    status: "loaded",
    constraintFingerprint: fingerprint,
    sourceInputFingerprint: SOURCE_INPUT_V2,
    boardDataSourceVersion: BOARD_VERSION_V2,
  }, fingerprint, "");

  assert.equal(previousLoaded.fields.length > 0, true);
  assert.equal(resynced.fields.length, 0);
  assert.equal(resynced.workflowSections.length, 0);
  assert.equal(resynced.staleSourceVersionBinding, true);
  assert.equal(resynced.sourceVersionBindingMatched, false);
  assert.equal(resynced.stalePreviousFieldsCount, previousLoaded.fields.length);
  assert.equal(resynced.previousFieldsReused, false);
});

test("live option response currency check can reject stale source-version responses", () => {
  const fingerprint = selectorConstraintFingerprintFromQuery("?system=DNX%7C60");

  assert.equal(selectorReferenceOptionsResponseIsCurrent({
    requestId: 7,
    activeRequestId: 7,
    responseConstraintFingerprint: fingerprint,
    activeConstraintFingerprint: fingerprint,
    responseSourceInputFingerprint: SOURCE_INPUT_V1,
    activeSourceInputFingerprint: SOURCE_INPUT_V2,
    responseBoardDataSourceVersion: BOARD_VERSION_V1,
    activeBoardDataSourceVersion: BOARD_VERSION_V2,
    mounted: true,
  }), false);

  assert.equal(selectorReferenceOptionsResponseIsCurrent({
    requestId: 7,
    activeRequestId: 7,
    responseConstraintFingerprint: fingerprint,
    activeConstraintFingerprint: fingerprint,
    responseSourceInputFingerprint: SOURCE_INPUT_V2,
    activeSourceInputFingerprint: SOURCE_INPUT_V2,
    responseBoardDataSourceVersion: BOARD_VERSION_V2,
    activeBoardDataSourceVersion: BOARD_VERSION_V2,
    mounted: true,
  }), true);
});

test("view-model selected values carry source-version binding into selector state", () => {
  const selectorState = createSelectorState();
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot(), {
    source: sourceReady(SOURCE_INPUT_V1, BOARD_VERSION_V1),
  });
  const model = createSelectorViewModel({
    adapter: adapter(),
    selectorState,
    selectorReferenceStatus: result,
    onLocalStateChange: () => {},
  });

  model.selectorSurface.setFieldValue("cctCri", "cct_cri:3000K|CRI80");
  const selected = selectorState.getSnapshot().dbBackedSelector.manualConstraints.cctCri;

  assert.equal(selected.value, "cct_cri:3000K|CRI80");
  assert.equal(selected.sourceInputFingerprint, SOURCE_INPUT_V1);
  assert.equal(selected.boardDataSourceVersion, BOARD_VERSION_V1);
  assert.equal(selected.sourceVersionBinding.staleRevalidationEnabled, true);
  assert.equal(selected.sourceVersionBinding.staleValuesInsertedIntoOptions, false);
});
