export function createCanonicalLanguageState() {
  const state = {
    selectedSection: "runtime-status-flags",
    readOnly: true,
    diagnosticOnly: true,
    localDirty: false,
    vocabularyReferenceOnly: true,
    clxWriteEnabled: false,
    glossaryMutationEnabled: false,
    synonymAutoCorrectionEnabled: false,
    hiddenWriteBackEnabled: false,
    lastAction: "mounted-read-only-diagnostic",
  };

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
