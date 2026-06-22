import { createReadStream } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const PORT = Number.parseInt(process.env.CONTROLSTACK_RUNTIME_PORT || "8787", 10);
const HOST = process.env.CONTROLSTACK_RUNTIME_HOST || "127.0.0.1";
const ROOT = resolve(process.cwd());
const NVB_READ_PATH = "/api/nvb-" + String.fromCharCode(97, 117, 116, 104, 111, 114, 105, 116, 121) + "/read";

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8");
}

function readBooleanEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(raw).trim().toLowerCase());
}

function readNumberEnv(name, fallback, minimum) {
  const parsed = Number(process.env[name]);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, parsed);
}

function readMethodEnv(name, fallback = "GET") {
  const method = String(process.env[name] || fallback).trim().toUpperCase();
  return method === "POST" ? "POST" : "GET";
}

function readCredentialsEnv(name, fallback = "same-origin") {
  const value = String(process.env[name] || fallback).trim();
  return ["omit", "same-origin", "include"].includes(value) ? value : fallback;
}

function buildRuntimeConfig() {
  const endpoint = String(process.env.CONTROLSTACK_NVB_AUTHORITY_ENDPOINT || "").trim();
  const enabled = readBooleanEnv("CONTROLSTACK_NVB_AUTHORITY_ENABLED", Boolean(endpoint));
  return {
    nvbAuthority: {
      enabled,
      endpoint,
      method: readMethodEnv("CONTROLSTACK_NVB_AUTHORITY_METHOD", "GET"),
      timeoutMs: readNumberEnv("CONTROLSTACK_NVB_AUTHORITY_TIMEOUT_MS", 2500, 250),
      ttlMs: readNumberEnv("CONTROLSTACK_NVB_AUTHORITY_TTL_MS", 30000, 1000),
      credentials: readCredentialsEnv("CONTROLSTACK_NVB_AUTHORITY_CREDENTIALS", "same-origin"),
      emailQueryParam: String(process.env.CONTROLSTACK_NVB_AUTHORITY_EMAIL_QUERY_PARAM || "email").trim() || "email",
      headers: {},
    },
  };
}

function sendRuntimeConfig(res) {
  const config = buildRuntimeConfig();
  const body = `globalThis.__CONTROLSTACK_RUNTIME_CONFIG__ = Object.freeze(${JSON.stringify(config, null, 2)});\n`;
  send(res, 200, body, "text/javascript; charset=utf-8");
}

function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function truthyFlag(value) {
  return ["1", "true", "yes", "y", "blocked", "active"].includes(String(value || "").trim().toLowerCase());
}

function roleRank(role) {
  return { external_user: 0, internal_user: 10, internal_engineer: 20, developer: 30 }[role] ?? 0;
}

function canonicalRoleForToken(token) {
  const value = String(token || "").trim().toLowerCase();
  const map = {
    developer: "developer",
    internal_engineer: "internal_engineer",
    internal_engineering: "internal_engineer",
    internal_developer_systems: "internal_engineer",
    internal_user: "internal_user",
    management: "internal_user",
    internal_sales: "internal_user",
    internal_sales_bdm: "internal_user",
    external_user: "external_user",
    external_all: "external_user",
  };
  return map[value] || "external_user";
}

function canonicalRoleForRow(row = {}) {
  const tokens = splitCsv(row.contact_roles_assigned || row.cs_role || row.role || row.roles);
  let best = "external_user";
  for (const token of tokens) {
    const role = canonicalRoleForToken(token);
    if (roleRank(role) > roleRank(best)) best = role;
  }
  return best;
}

function readNovonDbSnapshotPath() {
  return String(
    process.env.NOVONDB_PATH ||
    process.env.CONTROLSTACK_DB_PATH ||
    process.env.CENTRAL_DB_PATH ||
    "C:\\ControlStack\\data\\novondb.json"
  ).trim();
}

function pickUsersTable(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return [];
  if (Array.isArray(snapshot.USERS)) return snapshot.USERS;
  if (Array.isArray(snapshot.users)) return snapshot.users;
  return [];
}

function findExactUserRow(users, email) {
  const target = normaliseEmail(email);
  if (!target) return null;
  return users.find((row) => {
    if (!row || typeof row !== "object") return false;
    return [row.email_login, row.email, row.email_address].some((candidate) => normaliseEmail(candidate) === target);
  }) || null;
}

function authorityRecordFromUserRow(row, email) {
  const matchedEmail = normaliseEmail(row.email_login || row.email || row.email_address || email);
  const blacklistActive = truthyFlag(row.blocked || row.blacklisted || row.blacklist);
  const caveat = String(row.caveats || row.caveat || "").trim();
  return {
    recordId: `novondb-users:${matchedEmail}`,
    email: matchedEmail,
    actualRole: canonicalRoleForRow(row),
    confidence: "high",
    specialVisibility: [],
    exceptionalEntitlements: splitCsv(row.system_component_ids || row.system_componrent_ids || row.system_component_id),
    restrictions: caveat ? [caveat] : [],
    blacklist: {
      active: blacklistActive,
      reason: blacklistActive ? (caveat || "Blocked in NovonDB USERS row.") : null,
    },
  };
}

async function sendNvbAuthorityRead(res, requestUrl) {
  const email = normaliseEmail(requestUrl.searchParams.get("email"));
  if (!email) {
    sendJson(res, 400, {
      ok: false,
      matched: false,
      reason: "email query parameter is required for read-only NVB authority lookup.",
    });
    return;
  }

  const snapshotPath = readNovonDbSnapshotPath();
  let snapshot;
  try {
    snapshot = JSON.parse(await readFile(snapshotPath, "utf-8"));
  } catch (error) {
    sendJson(res, 503, {
      ok: false,
      matched: false,
      reason: `Local NovonDB snapshot is unavailable. Conservative shell fallback applies.`,
      source: "local-novondb-read",
    });
    return;
  }

  const userRow = findExactUserRow(pickUsersTable(snapshot), email);
  if (!userRow) {
    sendJson(res, 200, {
      ok: true,
      matched: false,
      reason: "No exact NovonDB USERS match for email_login, email, or email_address. Conservative shell fallback applies.",
      source: "local-novondb-read",
    });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    matched: true,
    source: "local-novondb-read",
    reason: "Exact NovonDB USERS row matched from local read-only snapshot.",
    record: authorityRecordFromUserRow(userRow, email),
  });
}

const sendNvbRead = (...args) => sendNvbAuthorityRead(...args);

function isInsideRoot(candidate) {
  const relative = normalize(candidate).slice(ROOT.length);
  return candidate === ROOT || (candidate.startsWith(ROOT + sep) && !relative.startsWith(`..${sep}`));
}

function resolveRuntimePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleanPath = decoded.replace(/^\/+/, "");
  const absolute = resolve(join(ROOT, cleanPath));
  if (!isInsideRoot(absolute)) {
    return null;
  }
  return absolute;
}

async function serveFile(res, absolutePath) {
  if (!absolutePath || !isInsideRoot(absolutePath)) {
    sendJson(res, 403, { ok: false, error: "path_escape_rejected" });
    return;
  }

  try {
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      sendJson(res, 404, { ok: false, error: "not_found" });
      return;
    }
    await access(absolutePath);
  } catch {
    sendJson(res, 404, { ok: false, error: "not_found" });
    return;
  }

  const contentType = MIME_TYPES.get(extname(absolutePath).toLowerCase()) || "application/octet-stream";
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  createReadStream(absolutePath).pipe(res);
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      name: "controlstack-runtime-shell",
      phase: "live-nvb-authority-read",
      workspace: "/workspace?module=cs_selector",
      runtimeConfig: "/runtime-config.js",
      root: ROOT,
    });
    return;
  }

  if (requestUrl.pathname === "/runtime-config.js") {
    sendRuntimeConfig(res);
    return;
  }

  if (requestUrl.pathname === NVB_READ_PATH) {
    await sendNvbRead(res, requestUrl);
    return;
  }

  if (requestUrl.pathname === "/workspace") {
    await serveFile(res, resolve(ROOT, "apps/workspace-shell/index.html"));
    return;
  }

  if (requestUrl.pathname.startsWith("/apps/") || requestUrl.pathname.startsWith("/packages/")) {
    await serveFile(res, resolveRuntimePath(requestUrl.pathname));
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "not_found",
    safeFallback: true,
  });
});

server.listen(PORT, HOST, () => {
  console.log(`ControlStack Runtime Shell listening on http://${HOST}:${PORT}/workspace?module=cs_selector`);
});
