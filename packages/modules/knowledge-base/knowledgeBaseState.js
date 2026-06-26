export function createKnowledgeBaseState() {
  const state = {
    selectedSection: "runtime-status",
    readOnly: true,
    diagnosticOnly: true,
    knowledgeReferenceOnly: true,
    localDirty: false,
    kcWriteEnabled: false,
    kcPublishEnabled: false,
    approvalAutomationEnabled: false,
    lioraAutomationEnabled: false,
    clxMutationEnabled: false,
    hiddenWriteBackEnabled: false,
    lastAction: "mounted-read-only-knowledge-base-diagnostic-shell",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
