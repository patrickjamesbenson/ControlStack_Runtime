export function createBoardDataState() {
  const state = {
    status: "not-requested",
    statusPayload: null,
    loadedAt: null,
    lastAction: "mounted",
  };

  return {
    getSnapshot() {
      return { ...state };
    },

    setLoading() {
      state.status = "loading";
      state.lastAction = "status-loading";
      return this.getSnapshot();
    },

    setStatusPayload(payload) {
      state.status = payload?.ok === false ? "warning" : "ready";
      state.statusPayload = payload || null;
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-loaded";
      return this.getSnapshot();
    },

    setFailure(message) {
      state.status = "fetch-failed";
      state.statusPayload = {
        ok: false,
        endpoint: "/api/board-data/status",
        readOnly: true,
        diagnosticOnly: true,
        productDataAuthority: true,
        writeEnabled: false,
        selectorMutationEnabled: false,
        labProofAuthority: false,
        iesGenerationEnabled: false,
        googleSyncEnabled: false,
        activeSnapshotWriteEnabled: false,
        materialisedSnapshotWriteEnabled: false,
        rawRowsExposed: false,
        rawUsersExposed: false,
        rawUserHeadersExposed: false,
        candidateEditMode: false,
        approvedDataSource: "active authority-reference snapshot",
        counts: {},
        tableSummary: [],
        missingExpectedTables: [],
        warnings: [message || "Board Data status request failed."],
      };
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-failed";
      return this.getSnapshot();
    },
  };
}
