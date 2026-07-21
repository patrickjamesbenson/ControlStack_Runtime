import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

import {
  normaliseWorkspaceSavedProjectRecord,
  validateWorkspaceProjectId,
} from "./projectPersistenceContract.js";

const DEFAULT_SESSION_PROJECT_DIRECTORY = "data/session_projects";
const MAX_PROJECT_FILE_BYTES = 8 * 1024 * 1024;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isInsideDirectory(directory, candidate) {
  const base = resolve(directory);
  const target = resolve(candidate);
  return target.startsWith(`${base}${sep}`);
}

export function resolveSessionProjectDirectory({ rootDirectory, env = process.env } = {}) {
  const root = resolve(rootDirectory || process.cwd());
  return resolve(env.CS_SESSION_PROJECT_DIR || resolve(root, DEFAULT_SESSION_PROJECT_DIRECTORY));
}

export function createServerProjectPersistenceStore({
  rootDirectory = process.cwd(),
  env = process.env,
  fs = { mkdir, readFile, readdir, rename, rm, writeFile },
  now = () => Date.now(),
  processId = process.pid,
} = {}) {
  const directory = resolveSessionProjectDirectory({ rootDirectory, env });
  let temporaryOrdinal = 0;

  function projectFile(projectId) {
    const safeProjectId = validateWorkspaceProjectId(projectId);
    const target = resolve(directory, `${safeProjectId}.json`);
    if (!isInsideDirectory(directory, target)) {
      throw new TypeError("workspace-saved-project-path-traversal-rejected");
    }
    return target;
  }

  async function readProject(projectId) {
    const safeProjectId = validateWorkspaceProjectId(projectId);
    const path = projectFile(safeProjectId);
    let text;
    try {
      text = await fs.readFile(path, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        return Object.freeze({ ok: false, found: false, projectId: safeProjectId, blocker: "project-not-found" });
      }
      return Object.freeze({ ok: false, found: false, projectId: safeProjectId, blocker: "project-read-failed" });
    }
    if (Buffer.byteLength(text, "utf8") > MAX_PROJECT_FILE_BYTES) {
      return Object.freeze({ ok: false, found: true, projectId: safeProjectId, blocker: "project-record-too-large" });
    }
    try {
      const record = normaliseWorkspaceSavedProjectRecord(JSON.parse(text), {
        expectedProjectId: safeProjectId,
      });
      return Object.freeze({ ok: true, found: true, projectId: safeProjectId, record });
    } catch {
      return Object.freeze({ ok: false, found: true, projectId: safeProjectId, blocker: "project-record-malformed" });
    }
  }

  async function readAllProjects() {
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") {
        return Object.freeze({ ok: true, records: Object.freeze([]), skipped: Object.freeze([]) });
      }
      return Object.freeze({ ok: false, records: Object.freeze([]), skipped: Object.freeze([]), blocker: "project-directory-read-failed" });
    }

    const records = [];
    const skipped = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const projectId = entry.name.slice(0, -5);
      try {
        validateWorkspaceProjectId(projectId);
      } catch {
        skipped.push(Object.freeze({ projectId: null, blocker: "project-filename-invalid" }));
        continue;
      }
      const result = await readProject(projectId);
      if (result.ok) records.push(result.record);
      else skipped.push(Object.freeze({ projectId, blocker: result.blocker }));
    }
    records.sort((left, right) => left.projectId.localeCompare(right.projectId));
    return Object.freeze({
      ok: true,
      records: Object.freeze(records),
      skipped: Object.freeze(skipped),
    });
  }

  async function saveProject({ projectId, record } = {}) {
    const safeProjectId = validateWorkspaceProjectId(projectId);
    const canonical = normaliseWorkspaceSavedProjectRecord(record, {
      expectedProjectId: safeProjectId,
    });
    const target = projectFile(safeProjectId);
    temporaryOrdinal += 1;
    const temporary = resolve(
      directory,
      `.${safeProjectId}.json.tmp-${processId}-${now()}-${temporaryOrdinal}`,
    );
    if (!isInsideDirectory(directory, temporary)) {
      throw new TypeError("workspace-saved-project-temp-path-traversal-rejected");
    }
    const text = `${JSON.stringify(canonical, null, 2)}\n`;
    if (Buffer.byteLength(text, "utf8") > MAX_PROJECT_FILE_BYTES) {
      throw new TypeError("workspace-saved-project-record-too-large");
    }

    await fs.mkdir(directory, { recursive: true });
    try {
      await fs.writeFile(temporary, text, { encoding: "utf8", flag: "wx" });
      await fs.rename(temporary, target);
    } catch (error) {
      try {
        await fs.rm(temporary, { force: true });
      } catch {
        // Best-effort temporary cleanup only; the previous authoritative file is untouched.
      }
      throw error;
    }
    return Object.freeze({
      ok: true,
      projectId: safeProjectId,
      record: clone(canonical),
      atomicReplacement: true,
    });
  }

  return Object.freeze({
    owner: "governance-shell",
    authority: "server-json",
    projectFile,
    readProject,
    readAllProjects,
    saveProject,
  });
}
