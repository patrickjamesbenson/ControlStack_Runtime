export function createSelectorState() {
  const state = {
    selectedCategory: "overview",
    localDirty: false,
    lastAction: "mounted",
  };

  return {
    getSnapshot() {
      return { ...state };
    },

    setCategory(category) {
      state.selectedCategory = category;
      state.lastAction = `category:${category}`;
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
