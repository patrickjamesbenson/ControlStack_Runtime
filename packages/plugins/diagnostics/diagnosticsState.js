export function createDiagnosticsState() {
  const state = {
    selectedSection: "overview",
    expanded: true,
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

    setExpanded(expanded) {
      state.expanded = expanded === true;
      state.lastAction = state.expanded ? "expanded" : "collapsed";
      return this.getSnapshot();
    },
  };
}
