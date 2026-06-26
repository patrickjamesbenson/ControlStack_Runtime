const BOARD_DATA_STATUS_ENDPOINT = "/api/board-data/status";

const SAFE_STATUS_BASE = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  writeEnabled: false,
  selectorMutationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotPromotionEnabled: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawGoogleRowsExposed: false,
  rawLabEvidenceExposed: false,
  donorCodeMounted: false,
  candidateEditMode: false,
});

function safeStatusOverridesFor(payload = {}) {
  const ok = payload?.ok === true;
  return {
    ...SAFE_STATUS_BASE,
    productDataAuthority: ok,
    approvedDataSource: ok ? "active authority-reference snapshot" : "unavailable",
  };
}

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
      state.statusPayload = {
        ...(payload || {}),
        endpoint: payload?.endpoint || BOARD_DATA_STATUS_ENDPOINT,
        ...safeStatusOverridesFor(payload),
      };
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-loaded";
      return this.getSnapshot();
    },

    setFailure(message) {
      state.status = "fetch-failed";
      state.statusPayload = {
        ok: false,
        endpoint: BOARD_DATA_STATUS_ENDPOINT,
        moduleId: "board_data",
        label: "Board Data",
        ...safeStatusOverridesFor({ ok: false }),
        counts: {},
        tableSummary: [],
        missingExpectedTables: [],
        warnings: [
          "Board Data status unavailable",
          message || "Board Data status request failed.",
          "Board Data is read-only in this slice.",
          "This inspector shows redacted summaries only.",
        ],
      };
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-failed";
      return this.getSnapshot();
    },
  };
}
