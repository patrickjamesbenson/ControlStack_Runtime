import { readFile, stat } from "node:fs/promises";

export const DEFAULT_SELECTOR_REFERENCE_FS_API = Object.freeze({ readFile, stat });

function safeString(value) {
  return String(value || "").trim();
}

function statModifiedToken(sourceStat = {}) {
  if (Number.isFinite(sourceStat?.mtimeMs)) return String(sourceStat.mtimeMs);
  const iso = sourceStat?.mtime?.toISOString?.();
  if (iso) return iso;
  return safeString(sourceStat?.modifiedTime || sourceStat?.mtime || "");
}

function effectiveSourceFingerprint(sourceStat = {}) {
  return JSON.stringify([
    statModifiedToken(sourceStat),
    sourceStat?.size ?? null,
    sourceStat?.ino ?? null,
  ]);
}

function notify(observer, payload) {
  if (typeof observer !== "function") return;
  try {
    observer(payload);
  } catch {
    // Cache observers are diagnostic-only and must never affect runtime GET behaviour.
  }
}

export function createSelectorReferenceRuntimeSnapshotCache({ onSnapshotLoad, onIndexBuild } = {}) {
  const stateByFsApi = new WeakMap();

  function stateFor(fsApi) {
    if (!fsApi || (typeof fsApi !== "object" && typeof fsApi !== "function")) {
      throw new TypeError("Selector Reference runtime snapshot cache requires an fs adapter object.");
    }
    let state = stateByFsApi.get(fsApi);
    if (!state) {
      state = {
        current: null,
        snapshotFlights: new Map(),
      };
      stateByFsApi.set(fsApi, state);
    }
    return state;
  }

  async function getSnapshot({ sourcePath, fsApi = DEFAULT_SELECTOR_REFERENCE_FS_API } = {}) {
    const state = stateFor(fsApi);
    const sourcePathKey = safeString(sourcePath);
    const existingFlight = state.snapshotFlights.get(sourcePathKey);
    if (existingFlight) return existingFlight;

    const flight = (async () => {
      const sourceStat = await fsApi.stat(sourcePath);
      const fingerprint = effectiveSourceFingerprint(sourceStat);
      const current = state.current;
      if (current && current.sourcePathKey === sourcePathKey && current.effectiveSourceFingerprint === fingerprint) {
        return current;
      }

      const text = await fsApi.readFile(sourcePath, "utf-8");
      const snapshot = JSON.parse(text);
      const entry = {
        sourcePathKey,
        sourceStat,
        effectiveSourceFingerprint: fingerprint,
        snapshot,
        indexValues: new Map(),
        indexFlights: new Map(),
      };
      state.current = entry;
      notify(onSnapshotLoad, {
        sourcePathKey,
        effectiveSourceFingerprint: fingerprint,
      });
      return entry;
    })();

    state.snapshotFlights.set(sourcePathKey, flight);
    try {
      return await flight;
    } finally {
      if (state.snapshotFlights.get(sourcePathKey) === flight) state.snapshotFlights.delete(sourcePathKey);
    }
  }

  async function getIndex({ sourcePath, fsApi = DEFAULT_SELECTOR_REFERENCE_FS_API, indexKey = "default", buildIndex } = {}) {
    if (typeof buildIndex !== "function") throw new TypeError("Selector Reference runtime snapshot cache requires an index builder.");
    const entry = await getSnapshot({ sourcePath, fsApi });
    const safeIndexKey = safeString(indexKey) || "default";
    if (entry.indexValues.has(safeIndexKey)) {
      return {
        sourceStat: entry.sourceStat,
        snapshot: entry.snapshot,
        effectiveSourceFingerprint: entry.effectiveSourceFingerprint,
        index: entry.indexValues.get(safeIndexKey),
      };
    }

    const existingFlight = entry.indexFlights.get(safeIndexKey);
    if (existingFlight) {
      const index = await existingFlight;
      return {
        sourceStat: entry.sourceStat,
        snapshot: entry.snapshot,
        effectiveSourceFingerprint: entry.effectiveSourceFingerprint,
        index,
      };
    }

    const indexFlight = Promise.resolve().then(() => {
      notify(onIndexBuild, {
        sourcePathKey: entry.sourcePathKey,
        effectiveSourceFingerprint: entry.effectiveSourceFingerprint,
        indexKey: safeIndexKey,
      });
      return buildIndex(entry.snapshot, {
        sourceStat: entry.sourceStat,
        effectiveSourceFingerprint: entry.effectiveSourceFingerprint,
      });
    });
    entry.indexFlights.set(safeIndexKey, indexFlight);

    try {
      const index = await indexFlight;
      entry.indexValues.set(safeIndexKey, index);
      return {
        sourceStat: entry.sourceStat,
        snapshot: entry.snapshot,
        effectiveSourceFingerprint: entry.effectiveSourceFingerprint,
        index,
      };
    } finally {
      if (entry.indexFlights.get(safeIndexKey) === indexFlight) entry.indexFlights.delete(safeIndexKey);
    }
  }

  return Object.freeze({
    getSnapshot,
    getIndex,
  });
}

export const selectorReferenceRuntimeSnapshotCache = createSelectorReferenceRuntimeSnapshotCache();
