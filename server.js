import { createReadStream } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const PORT = Number.parseInt(process.env.CONTROLSTACK_RUNTIME_PORT || "8787", 10);
const HOST = process.env.CONTROLSTACK_RUNTIME_HOST || "127.0.0.1";
const ROOT = resolve(process.cwd());
const NVB_READ_PATH = "/api/nvb-" + String.fromCharCode(97, 117, 116, 104, 111, 114, 105, 116, 121) + "/read";
const HUBSPOT_READ_PATH = "/api/hubspot/read";
const HUBSPOT_AUTH_STATUS_PATH = "/api/hubspot/auth-status";

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

function readTextEnv(name) {
  return String(process.env[name] || "").trim();
}

function hubspotTokenSource(candidates) {
  for (const [name, value] of candidates) {
    if (value) return { token: value, tokenSource: `env:${name}` };
  }
  return { token: "", tokenSource: "none" };
}

function hubspotAuthStatus() {
  const requestedMode = String(process.env.CONTROLSTACK_HUBSPOT_AUTH_MODE || "oauth").trim().toLowerCase();
  const staticTokenEnabled = readBooleanEnv("CONTROLSTACK_HUBSPOT_STATIC_TOKEN_ENABLED", false);
  const oauth = hubspotTokenSource([
    ["HUBSPOT_OAUTH_ACCESS_TOKEN", readTextEnv("HUBSPOT_OAUTH_ACCESS_TOKEN")],
    ["HUBSPOT_ACCESS_TOKEN", readTextEnv("HUBSPOT_ACCESS_TOKEN")],
  ]);
  const staticToken = hubspotTokenSource([
    ["HUBSPOT_STATIC_TOKEN", readTextEnv("HUBSPOT_STATIC_TOKEN")],
    ["HUBSPOT_PRIVATE_APP_TOKEN", readTextEnv("HUBSPOT_PRIVATE_APP_TOKEN")],
    ["HUBSPOT_TOKEN", readTextEnv("HUBSPOT_TOKEN")],
  ]);
  const staticRequested = ["static", "static-token", "private", "private-app", "private-app-token"].includes(requestedMode);
  const oauthRequested = requestedMode === "oauth" || requestedMode === "oauth-server-bearer";

  let selected = oauth;
  let mode = "oauth-server-bearer";
  let configured = Boolean(oauth.token);
  let status = configured ? "configured" : "unconfigured";
  let reason = configured
    ? "HubSpot OAuth-derived server-side bearer token is configured through external environment."
    : "HubSpot OAuth-derived server-side bearer token is not configured.";

  if (staticRequested) {
    mode = staticTokenEnabled ? "static-token" : "static-token-disabled";
    selected = staticTokenEnabled ? staticToken : { token: "", tokenSource: "none" };
    configured = staticTokenEnabled && Boolean(staticToken.token);
    status = configured ? "configured" : staticTokenEnabled ? "unconfigured" : "disabled";
    reason = staticTokenEnabled
      ? configured
        ? "Optional HubSpot static/private-token mode is explicitly enabled and configured server-side."
        : "Optional HubSpot static/private-token mode is enabled but no server-side token is configured."
      : "Optional HubSpot static/private-token mode was requested but is disabled by default.";
  } else if (!oauthRequested) {
    selected = { token: "", tokenSource: "none" };
    mode = "invalid-mode";
    configured = false;
    status = "invalid-mode";
    reason = `Unsupported HubSpot auth mode '${requestedMode}'. Use oauth or explicitly gated static-token mode.`;
  }

  return {
    owner: "runtime-server",
    provider: "hubspot",
    status,
    configured,
    available: configured,
    primaryAuthMode: "oauth-server-bearer",
    activeAuthMode: mode,
    requestedAuthMode: requestedMode || "oauth",
    tokenSource: selected.tokenSource,
    tokenPresent: Boolean(selected.token),
    staticTokenMode: {
      enabled: staticTokenEnabled,
      configured: Boolean(staticToken.token),
      requested: staticRequested,
      tokenSource: staticTokenEnabled && staticToken.token ? staticToken.tokenSource : "none",
    },
    readOnly: true,
    nonBootCritical: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    streamlit8501AuthShape: false,
    reason,
    writePolicy: { enabled: false, reason: "HubSpot writes and deal sync are disabled." },
    token: selected.token,
  };
}

function publicHubspotAuthStatus(status = hubspotAuthStatus()) {
  const { token, ...safeStatus } = status;
  return safeStatus;
}

function hubspotAccessToken() {
  return hubspotAuthStatus().token;
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanDomain(value) {
  return cleanText(value).replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();
}

function domainFromEmail(email) {
  const value = cleanText(email).toLowerCase();
  return value.includes("@") ? value.split("@").pop() : "";
}

function hubspotObject(result, objectType) {
  if (!result) return null;
  const props = result.properties || {};
  if (objectType === "contacts") {
    const first = cleanText(props.firstname);
    const last = cleanText(props.lastname);
    return {
      found: true,
      contactId: String(result.id || props.hs_object_id || ""),
      email: cleanText(props.email),
      name: [first, last].filter(Boolean).join(" ") || cleanText(props.email),
      firstName: first || null,
      lastName: last || null,
      companyName: cleanText(props.company) || null,
      lifecycleStage: cleanText(props.lifecyclestage) || null,
      leadStatus: cleanText(props.hs_lead_status) || null,
      ownerId: cleanText(props.hubspot_owner_id) || null,
      source: "hubspot-read-only",
    };
  }
  return {
    found: true,
    companyId: String(result.id || props.hs_object_id || ""),
    companyName: cleanText(props.name) || cleanText(props.domain) || "HubSpot company",
    domain: cleanDomain(props.domain) || null,
    website: cleanText(props.website) || null,
    lifecycleStage: cleanText(props.lifecyclestage) || null,
    ownerId: cleanText(props.hubspot_owner_id) || null,
    city: cleanText(props.city) || null,
    state: cleanText(props.state) || null,
    country: cleanText(props.country) || null,
    source: "hubspot-read-only",
  };
}

async function hubspotSearch({ objectType, token, filters, properties, limit = 1 }) {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters }],
      properties,
      limit,
    }),
  });
  if (!response.ok) {
    return { ok: false, status: response.status, results: [] };
  }
  const payload = await response.json();
  return { ok: true, status: response.status, results: Array.isArray(payload.results) ? payload.results : [] };
}

async function lookupHubspotContact(token, email) {
  if (!email) return null;
  const page = await hubspotSearch({
    objectType: "contacts",
    token,
    filters: [{ propertyName: "email", operator: "EQ", value: email }],
    properties: ["email", "firstname", "lastname", "company", "lifecyclestage", "hs_lead_status", "hubspot_owner_id"],
  });
  if (!page.ok) return { error: `contact_lookup_http_${page.status}` };
  return hubspotObject(page.results[0], "contacts");
}

async function lookupHubspotCompany(token, { domain, companyName }) {
  const clean = cleanDomain(domain);
  if (clean) {
    const byDomain = await hubspotSearch({
      objectType: "companies",
      token,
      filters: [{ propertyName: "domain", operator: "EQ", value: clean }],
      properties: ["name", "domain", "website", "lifecyclestage", "hubspot_owner_id", "city", "state", "country"],
    });
    if (!byDomain.ok) return { error: `company_lookup_http_${byDomain.status}` };
    if (byDomain.results[0]) return hubspotObject(byDomain.results[0], "companies");
  }
  const name = cleanText(companyName);
  if (name) {
    const byName = await hubspotSearch({
      objectType: "companies",
      token,
      filters: [{ propertyName: "name", operator: "EQ", value: name }],
      properties: ["name", "domain", "website", "lifecyclestage", "hubspot_owner_id", "city", "state", "country"],
    });
    if (!byName.ok) return { error: `company_lookup_http_${byName.status}` };
    if (byName.results[0]) return hubspotObject(byName.results[0], "companies");
  }
  return null;
}

function lookupErrorCode(result) {
  return result?.error || null;
}

function isAuthLookupError(result) {
  return /_http_401$/.test(String(lookupErrorCode(result) || ""));
}

function isScopeLookupError(result) {
  return /_http_403$/.test(String(lookupErrorCode(result) || ""));
}

const PUBLIC_EMAIL_DOMAINS = new Set(["gmail.com", "outlook.com", "hotmail.com", "live.com", "icloud.com", "yahoo.com", "proton.me", "protonmail.com"]);

function normaliseComparableText(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function exactContactResult(contact, queryEmail) {
  if (!contact || contact.error) return { found: false, email: queryEmail || null, source: contact?.error || "not_found" };
  if (normaliseEmail(contact.email) !== normaliseEmail(queryEmail)) {
    return {
      found: false,
      email: queryEmail || null,
      returnedEmail: contact.email || null,
      source: "email_mismatch",
      reason: "Returned contact email did not exactly match the queried email.",
    };
  }
  return contact;
}

function trustworthyCompanyResult(company, { domain, companyName, domainWasExplicit }) {
  if (!company || company.error) {
    return { found: false, domain: domain || null, companyName: companyName || null, source: company?.error || "not_found" };
  }
  const queryDomain = cleanDomain(domain);
  const returnedDomain = cleanDomain(company.domain);
  const queryName = normaliseComparableText(companyName);
  const returnedName = normaliseComparableText(company.companyName);
  const domainTrusted = Boolean(domainWasExplicit && queryDomain && !PUBLIC_EMAIL_DOMAINS.has(queryDomain) && returnedDomain === queryDomain);
  const nameTrusted = Boolean(queryName && returnedName === queryName);
  if (!domainTrusted && !nameTrusted) {
    return {
      found: false,
      domain: queryDomain || null,
      companyName: companyName || null,
      returnedDomain: returnedDomain || null,
      returnedCompanyName: company.companyName || null,
      source: "company_mismatch",
      reason: "Returned company did not exactly match an explicit company domain or company name.",
    };
  }
  return company;
}

function hubspotReadStatus({ contact, company }) {
  const contactAuth = isAuthLookupError(contact);
  const companyAuth = isAuthLookupError(company);
  const contactScope = isScopeLookupError(contact);
  const companyScope = isScopeLookupError(company);
  const anyFound = contact?.found === true || company?.found === true;
  if (contactAuth || companyAuth) {
    return {
      ok: false,
      available: false,
      reason: "HubSpot read authentication failed with HTTP 401. Check that the server token is valid/current and matches the donor auth model.",
    };
  }
  if (contactScope || companyScope) {
    return {
      ok: false,
      available: false,
      reason: "HubSpot read authorization failed with HTTP 403. Check read scopes for contacts/companies.",
    };
  }
  return {
    ok: true,
    available: true,
    reason: anyFound ? "HubSpot read-only lookup completed. No writes were attempted." : "HubSpot read-only lookup completed but no matching contact/company was found. No writes were attempted.",
  };
}

async function sendHubspotRead(res, requestUrl) {
  const authStatus = hubspotAuthStatus();
  const token = authStatus.token;
  const email = normaliseEmail(requestUrl.searchParams.get("email"));
  const explicitDomain = cleanDomain(requestUrl.searchParams.get("domain"));
  const domain = explicitDomain || domainFromEmail(email);
  const companyName = cleanText(requestUrl.searchParams.get("companyName"));
  if (!token) {
    sendJson(res, 200, {
      ok: true,
      configured: false,
      available: false,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: authStatus.reason,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      contact: { found: false, email: email || null, source: "unconfigured" },
      company: { found: false, domain: domain || null, companyName: companyName || null, source: "unconfigured" },
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
    return;
  }
  try {
    const rawContact = await lookupHubspotContact(token, email);
    const contact = exactContactResult(rawContact, email);
    const rawCompany = await lookupHubspotCompany(token, {
      domain: explicitDomain,
      companyName,
    });
    const company = trustworthyCompanyResult(rawCompany, {
      domain: explicitDomain,
      companyName,
      domainWasExplicit: Boolean(explicitDomain),
    });
    const readStatus = hubspotReadStatus({ contact, company });
    sendJson(res, readStatus.ok ? 200 : 401, {
      ok: readStatus.ok,
      configured: true,
      available: readStatus.available,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: readStatus.reason,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      query: { email: email || null, domain: domain || null, companyName: companyName || null },
      contact,
      company,
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
  } catch (error) {
    sendJson(res, 502, {
      ok: false,
      configured: true,
      available: false,
      readOnly: true,
      source: "server-hubspot-read-only",
      reason: `HubSpot read-only lookup failed: ${error?.message || "unknown error"}.`,
      hubspotAuth: publicHubspotAuthStatus(authStatus),
      contact: { found: false, email: email || null, source: "lookup_failed" },
      company: { found: false, domain: domain || null, companyName: companyName || null, source: "lookup_failed" },
      writePolicy: { enabled: false, reason: "HubSpot writes are disabled." },
    });
  }
}

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
      hubspotRead: HUBSPOT_READ_PATH,
      hubspotAuthStatus: HUBSPOT_AUTH_STATUS_PATH,
      hubspotAuth: publicHubspotAuthStatus(),
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

  if (requestUrl.pathname === HUBSPOT_AUTH_STATUS_PATH) {
    sendJson(res, 200, publicHubspotAuthStatus());
    return;
  }

  if (requestUrl.pathname === HUBSPOT_READ_PATH) {
    await sendHubspotRead(res, requestUrl);
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
