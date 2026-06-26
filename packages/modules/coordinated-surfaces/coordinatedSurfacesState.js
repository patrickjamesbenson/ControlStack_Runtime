export function createCoordinatedSurfacesState() {
  const state = Object.freeze({
    readOnly: true,
    diagnosticOnly: true,
    lastAction: "mounted-read-only-diagnostic",
  });

  return {
    getSnapshot() {
      return { ...state };
    },
  };
}
