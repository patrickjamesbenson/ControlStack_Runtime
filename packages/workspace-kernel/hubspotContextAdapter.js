export function createHubSpotContextAdapter() {
  const snapshot = {
    owner: "shell",
    status: "placeholder",
    available: false,
    source: "phase-4-placeholder",
    writePolicy: {
      enabled: false,
      reason: "Phase 4 exposes read-only CRM context only; HubSpot writes are deferred.",
    },
  };

  return {
    owner: snapshot.owner,
    status: snapshot.status,
    getContextSnapshot() {
      return {
        ...snapshot,
        writePolicy: { ...snapshot.writePolicy },
      };
    },
    explainDeferredWrites() {
      return { ...snapshot.writePolicy };
    },
  };
}
