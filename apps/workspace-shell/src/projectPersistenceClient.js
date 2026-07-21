import {
  migrateWorkspaceSavedProjectRecord,
  normaliseWorkspaceSavedProjectRecord,
  validateWorkspaceProjectId,
  workspaceSavedProjectCacheKey,
  WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY,
} from "../../../packages/workspace-kernel/governance/projectPersistenceContract.js";

export const PROJECT_PERSISTENCE_SAVE_PATH = "/api/session/save";
export const PROJECT_PERSISTENCE_READ_PATH = "/api/session/read";
const MIGRATION_BACKUP_PREFIX = "workspace_saved_project.v2:backup:";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function readIndex(storage) {
  const parsed = parseJson(storage?.getItem?.(WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY), []);
  if (!Array.isArray(parsed)) return [];
  const valid = [];
  for (const value of parsed) {
    try {
      valid.push(validateWorkspaceProjectId(value));
    } catch {
      // Invalid cache index entries are ignored and never sent to the server.
    }
  }
  return [...new Set(valid)].sort();
}

function writeCacheRecord(storage, record) {
  if (!storage) return;
  const canonical = normaliseWorkspaceSavedProjectRecord(record, {
    expectedProjectId: record.projectId,
  });
  storage.setItem(workspaceSavedProjectCacheKey(canonical.projectId), JSON.stringify(canonical));
  const nextIndex = [...new Set([...readIndex(storage), canonical.projectId])].sort();
  storage.setItem(WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY, JSON.stringify(nextIndex));
}

function writeMigrationBackup(storage, sourceKey, records) {
  if (!storage || typeof sourceKey !== "string" || !sourceKey.trim()) return;
  const backupKey = `${MIGRATION_BACKUP_PREFIX}${sourceKey.trim()}`;
  if (storage.getItem(backupKey) === null) {
    storage.setItem(backupKey, JSON.stringify(records));
  }
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.blocker || "project-persistence-request-failed");
  }
  return payload;
}

export function createProjectPersistenceClient({
  enabled = false,
  fetchImpl = globalThis.fetch?.bind(globalThis),
  storage = globalThis.localStorage,
} = {}) {
  async function post(path, body) {
    if (typeof fetchImpl !== "function") {
      throw new Error("project-persistence-fetch-unavailable");
    }
    const response = await fetchImpl(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  }

  async function saveRecord(record) {
    if (!enabled) {
      return Object.freeze({ ok: false, memoryOnly: true, blocker: "project-persistence-live-disabled" });
    }
    const canonical = normaliseWorkspaceSavedProjectRecord(record, {
      expectedProjectId: record?.projectId,
    });
    const payload = await post(PROJECT_PERSISTENCE_SAVE_PATH, {
      projectId: canonical.projectId,
      record: canonical,
    });
    const saved = normaliseWorkspaceSavedProjectRecord(payload.record, {
      expectedProjectId: canonical.projectId,
    });
    writeCacheRecord(storage, saved);
    return Object.freeze({ ok: true, memoryOnly: false, record: saved });
  }

  async function readProject(projectId) {
    if (!enabled) {
      return Object.freeze({ ok: false, memoryOnly: true, blocker: "project-persistence-live-disabled" });
    }
    const safeProjectId = validateWorkspaceProjectId(projectId);
    const payload = await post(PROJECT_PERSISTENCE_READ_PATH, { projectId: safeProjectId });
    const record = normaliseWorkspaceSavedProjectRecord(payload.record, {
      expectedProjectId: safeProjectId,
    });
    writeCacheRecord(storage, record);
    return Object.freeze({ ok: true, memoryOnly: false, record });
  }

  async function readAllProjects() {
    if (!enabled) {
      return Object.freeze({ ok: false, memoryOnly: true, records: Object.freeze([]), blocker: "project-persistence-live-disabled" });
    }
    const payload = await post(PROJECT_PERSISTENCE_READ_PATH, { all: true });
    const records = (Array.isArray(payload.records) ? payload.records : [])
      .map((record) => normaliseWorkspaceSavedProjectRecord(record, {
        expectedProjectId: record?.projectId,
      }))
      .sort((left, right) => left.projectId.localeCompare(right.projectId));
    for (const record of records) writeCacheRecord(storage, record);
    return Object.freeze({
      ok: true,
      memoryOnly: false,
      records: Object.freeze(records),
      skipped: Object.freeze(Array.isArray(payload.skipped) ? clone(payload.skipped) : []),
    });
  }

  async function migrateExplicitRecords(records, {
    sourceKey,
    createEnvelopeFromDonorV1,
  } = {}) {
    if (!enabled) {
      return Object.freeze({ ok: false, memoryOnly: true, migrated: Object.freeze([]), blocker: "project-persistence-live-disabled" });
    }
    if (!Array.isArray(records)) throw new TypeError("project-persistence-migration-records-invalid");
    writeMigrationBackup(storage, sourceKey, records);
    const migrated = [];
    const skipped = [];
    for (const candidate of records) {
      try {
        const canonical = migrateWorkspaceSavedProjectRecord(candidate, {
          createEnvelopeFromDonorV1,
        });
        const result = await saveRecord(canonical);
        migrated.push(result.record.projectId);
      } catch (error) {
        skipped.push({
          projectId: candidate?.projectId || candidate?.project_id || candidate?.job_id || null,
          blocker: error?.message || "project-persistence-migration-failed",
        });
      }
    }
    return Object.freeze({
      ok: true,
      migrated: Object.freeze([...new Set(migrated)].sort()),
      skipped: Object.freeze(clone(skipped)),
    });
  }

  async function flushLiveMemoryRecords(records) {
    return migrateExplicitRecords(records, {
      sourceKey: "live-memory-flush",
    });
  }

  return Object.freeze({
    owner: "governance-shell",
    enabled,
    saveRecord,
    readProject,
    readAllProjects,
    migrateExplicitRecords,
    flushLiveMemoryRecords,
  });
}
