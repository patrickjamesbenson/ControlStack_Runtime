export function createEmergenceState() {
  const state = {
    selectedSection: "overview",
    localDirty: false,
    lastAction: "mounted",
  };

  return {
    getSnapshot() {
      return { ...state };
    },

    setSection(section) {
      state.selectedSection = section;
      state.lastAction = `section:${section}`;
      return this.getSnapshot();
    },

    markLocalDirty(reason = "local-ui-change") {
      state.localDirty = true;
      state.lastAction = reason;
      return this.getSnapshot();
    },

    clearLocalDirty(reason = "local-ui-reset") {
      state.localDirty = false;
      state.lastAction = reason;
      return this.getSnapshot();
    },
  };
}
