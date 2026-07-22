const DOWNSTREAM_BLOCKING_DIAGNOSTICS = Object.freeze([
  "engine-verify-not-approved",
  "runtable-generation-not-approved",
  "ies-generation-not-approved",
]);

function text(value) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value) {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  const raw = text(value);
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveMm(value) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  const raw = text(value).replace(/\s*mm$/i, "");
  if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function runIdentity(run = {}, index = 0) {
  const runNumber = parsePositiveInteger(run.runNumber) || index + 1;
  return {
    id: text(run.id) || `run-${runNumber}`,
    runNumber,
  };
}

export function normaliseSelectorRunIntakeRun(run = {}, index = 0) {
  const identity = runIdentity(run, index);
  const quantity = run.quantity ?? run.qty;
  const runLengthMm = run.runLengthMm ?? run.lengthMm;
  return {
    ...identity,
    label: text(run.label),
    quantity: text(quantity),
    runLengthMm: text(runLengthMm),
  };
}

export function createInitialSelectorRunIntakeState() {
  return {
    source: "module-local Selector run intake preview state",
    previewOnly: true,
    readOnlyDownstream: true,
    writes: false,
    runs: [],
  };
}

export function cloneSelectorRunIntakeState(value = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    source: source.source || "module-local Selector run intake preview state",
    previewOnly: true,
    readOnlyDownstream: true,
    writes: false,
    runs: Array.isArray(source.runs) ? source.runs.map(normaliseSelectorRunIntakeRun) : [],
  };
}

export function evaluateSelectorRunIntakeRun(run = {}, index = 0) {
  const normalised = normaliseSelectorRunIntakeRun(run, index);
  const quantity = parsePositiveInteger(normalised.quantity);
  const runLengthMm = parsePositiveMm(normalised.runLengthMm);
  const diagnostics = [];

  if (!normalised.label) diagnostics.push("missing-run-label");
  if (!text(normalised.quantity)) diagnostics.push("missing-run-quantity");
  else if (quantity === null) diagnostics.push("invalid-run-quantity");

  if (!text(normalised.runLengthMm)) diagnostics.push("missing-run-length");
  else if (runLengthMm === null) diagnostics.push("invalid-run-length");


  const complete = diagnostics.length === 0;
  const safeIntent = {
    id: normalised.id,
    runNumber: normalised.runNumber,
    label: normalised.label || `Run ${normalised.runNumber}`,
    quantity: quantity || 0,
    runLengthMm: runLengthMm || 0,
    status: complete ? "complete-safe-preview-intent" : "incomplete-fail-closed",
    safePreviewOnly: true,
    enginePayloadIncluded: false,
    runTableIncluded: false,
    iesIncluded: false,
    writes: false,
    diagnostics: [...diagnostics],
  };

  return {
    ...normalised,
    quantityValue: quantity,
    runLengthMmValue: runLengthMm,
    complete,
    diagnostics,
    safeIntent,
  };
}

export function buildSelectorRunIntakePreview(runs = []) {
  const evaluatedRuns = Array.isArray(runs) ? runs.map(evaluateSelectorRunIntakeRun) : [];
  const runCount = evaluatedRuns.length;
  const completedRunCount = evaluatedRuns.filter((run) => run.complete).length;
  const incompleteRunCount = runCount - completedRunCount;
  const totalQuantity = evaluatedRuns.reduce((total, run) => total + (run.quantityValue || 0), 0);
  const intakeDiagnostics = evaluatedRuns.flatMap((run) => run.diagnostics.map((diagnostic) => `${run.id}:${diagnostic}`));
  const downstreamDiagnostics = [...DOWNSTREAM_BLOCKING_DIAGNOSTICS];
  const runIntakePreviewReady = runCount > 0 && incompleteRunCount === 0;

  return {
    title: "Selector run intake preview",
    source: "runtime Selector run intake preview scaffold",
    readOnly: true,
    previewOnly: true,
    localStateOnly: true,
    runIntakePreviewReady,
    runCount,
    totalQuantity,
    completedRunCount,
    incompleteRunCount,
    safeRunIntentSummaries: evaluatedRuns.map((run) => ({ ...run.safeIntent })),
    runs: evaluatedRuns.map((run) => ({
      id: run.id,
      runNumber: run.runNumber,
      label: run.label,
      quantity: run.quantity,
      runLengthMm: run.runLengthMm,
      complete: run.complete,
      diagnostics: [...run.diagnostics],
    })),
    diagnostics: [...intakeDiagnostics, ...downstreamDiagnostics],
    missingOrInvalidDiagnostics: intakeDiagnostics,
    failClosedDiagnostics: downstreamDiagnostics,
    enginePayloadReady: false,
    engineVerifyReady: false,
    runTableReady: false,
    iesReady: false,
    rawEnginePayloadExposed: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    generation: false,
    proof: false,
    boundaryCopy: [
      "Run quantity, label, and physical length are captured as safe local intent only.",
      "Completion requires run label, positive quantity, and positive physical run length.",
      "Run quantity does not infer any shared-length or manufacturing interpretation.",
      "Engine verify, raw Engine payload, RunTable generation, IES generation, selected-result persistence, routes, POST endpoints, and RuntimeData mutation remain disabled.",
    ],
    summaryRows: [
      ["runIntakePreviewReady", runIntakePreviewReady ? "true" : "false"],
      ["runCount", String(runCount)],
      ["totalQuantity", String(totalQuantity)],
      ["completedRunCount", String(completedRunCount)],
      ["incompleteRunCount", String(incompleteRunCount)],
      ["enginePayloadReady", "false"],
      ["engineVerifyReady", "false"],
      ["runTableReady", "false"],
      ["iesReady", "false"],
    ],
    safetyRows: [
      ["rawEnginePayloadExposed", "false"],
      ["donorEngineInvoked", "false"],
      ["runtimeDataMutated", "false"],
      ["selectedResultPersisted", "false"],
      ["runTableGenerated", "false"],
      ["iesGenerated", "false"],
      ["routesAdded", "false"],
      ["postEndpointsAdded", "false"],
    ],
  };
}
