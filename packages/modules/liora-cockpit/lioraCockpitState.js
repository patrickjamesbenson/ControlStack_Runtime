export function createLioraCockpitState() {
  const state = {
    selectedSection: "runtime-status-flags",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    activeMessageIngestionEnabled: false,
    chatAgentEnabled: false,
    draftCreationEnabled: false,
    sendEnabled: false,
    lastAction: "mounted-read-only-diagnostic",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
