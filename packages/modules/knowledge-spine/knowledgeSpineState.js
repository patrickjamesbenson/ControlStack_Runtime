export function createKnowledgeSpineState() {
  const state = {
    selectedSection: "runtime-status",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    activeAutomationEnabled: false,
    lastAction: "mounted-read-only-diagnostic-shell",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
