export function createEngineFlowState() {
  const state = {
    selectedSection: "runtime-status-flags",
    readOnly: true,
    diagnosticOnly: true,
    staticMapOnly: true,
    localDirty: false,
    engineExecutionEnabled: false,
    selectorFiringEnabled: false,
    lastAction: "mounted-read-only-static-confidence-process-map",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
