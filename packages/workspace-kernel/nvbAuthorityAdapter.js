const LIVE_READ_STATUS = Object.freeze({
  SUCCESS: "live-read-success",
  UNMATCHED: "live-read-unmatched",
  UNAVAILABLE: "live-read-unavailable",
  FAILED: "live-read-failed",
  TIMEOUT: "live-read-timeout",
  PENDING: "live-read-pending",
  NO_SUBJECT: "live-read-no-subject",
});

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function runtimeConfig() {
  const globalConfig = globalThis.__CONTROLSTACK_RUNTIME_CONFIG__ || {};
  return globalConfig.nvbAuthority || globalThis.__CONTROLSTACK_NVB_AUTHORITY_CONFIG__ || {};
}

function readSubject({ auth, identity } = {}) {
  const email = normaliseEmail(auth?.session?.email || identity?.currentUser?.email || identity?.email);
  const authUserId = auth?.session?.userId || identity?.currentUser?.id || null;
  return { email, authUserId };
}

function normaliseRole(role) {
  const value = String(role || "external_user").trim();
  return ["external_user", "internal_user", "internal_engineer", "developer", "admin"].includes(value) ? value : "external_user";
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function normaliseBlacklist(value = {}) {
  if (typeof value === "boolean") return { active: value, reason: null };
  return {
    active: value.active === true,
    reason: value.reason || null,
  };
}

function pickRecord(payload, subjectEmail) {
  if (!payload) return null;
  if (payload.record) return payload.record;
  if (payload.authority) return payload.authority;
  if (payload.subjectAuthority) return payload.subjectAuthority;
  if (Array.isArray(payload.records)) {
    return payload.records.find((candidate) => normaliseEmail(candidate.email || candidate.subjectEmail) === subjectEmail) || null;
  }
  if (payload.email || payload.subjectEmail || payload.actualRole || payload.role || payload.recordId || payload.id) return payload;
  return null;
}

function normaliseLiveRecord(record, subjectEmail) {
  if (!record) return null;
  return {
    recordId: String(record.recordId || record.id || record.nvbId || `live-nvb-${subjectEmail || "subject"}`),
    email: normaliseEmail(record.email || record.subjectEmail || subjectEmail),
    actualRole: normaliseRole(record.actualRole || record.role || record.authorityRole),
    confidence: record.confidence || record.matchConfidence || "medium",
    specialVisibility: arrayFrom(record.specialVisibility || record.specialPrivileges || record.visibilityPrivileges),
    exceptionalEntitlements: arrayFrom(record.exceptionalEntitlements || record.entitlements || record.exceptions),
    restrictions: arrayFrom(record.restrictions || record.restrictionCodes),
    blacklist: normaliseBlacklist(record.blacklist || record.blacklistState),
  };
}

function makeResult(overrides = {}) {
  return {
    available: false,
    checked: false,
    matched: false,
    source: "live-nvb-read",
    recordId: null,
    resolvedAt: nowIso(),
    confidence: "none",
    record: null,
    reason: "Live NVB authority read has not run.",
    liveReadStatus: LIVE_READ_STATUS.UNAVAILABLE,
    liveReadConfigured: false,
    nonBootCritical: true,
    timeoutMs: null,
    ...overrides,
  };
}

function configSummary(config = {}) {
  const endpoint = typeof config.endpoint === "string" ? config.endpoint.trim() : "";
  return {
    enabled: config.enabled !== false,
    endpoint,
    method: String(config.method || "GET").toUpperCase(),
    timeoutMs: Number.isFinite(Number(config.timeoutMs)) ? Math.max(250, Number(config.timeoutMs)) : 2500,
    ttlMs: Number.isFinite(Number(config.ttlMs)) ? Math.max(1000, Number(config.ttlMs)) : 30000,
    credentials: config.credentials || "same-origin",
    emailQueryParam: config.emailQueryParam || "email",
    headers: config.headers && typeof config.headers === "object" ? config.headers : {},
  };
}

function endpointWithSubject(config, subject) {
  const url = new URL(config.endpoint, globalThis.location?.origin || "http://localhost");
  url.searchParams.set(config.emailQueryParam, subject.email);
  if (subject.authUserId) url.searchParams.set("authUserId", subject.authUserId);
  return url.toString();
}

async function readLiveAuthority(config, subject) {
  if (typeof fetch !== "function") {
    return makeResult({
      available: false,
      checked: true,
      reason: "Fetch is unavailable in this runtime. Conservative shell fallback applies.",
      liveReadStatus: LIVE_READ_STATUS.UNAVAILABLE,
      liveReadConfigured: true,
      timeoutMs: config.timeoutMs,
    });
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutHandle = controller ? setTimeout(() => controller.abort(), config.timeoutMs) : null;
  try {
    const request = {
      method: config.method,
      credentials: config.credentials,
      headers: {
        Accept: "application/json",
        ...config.headers,
      },
      signal: controller?.signal,
    };
    let url = config.endpoint;
    if (config.method === "POST") {
      request.headers["Content-Type"] = request.headers["Content-Type"] || "application/json";
      request.body = JSON.stringify({ email: subject.email, authUserId: subject.authUserId });
    } else {
      url = endpointWithSubject(config, subject);
    }
    const response = await fetch(url, request);
    if (!response.ok) {
      return makeResult({
        available: true,
        checked: true,
        reason: `Live NVB authority read failed with HTTP ${response.status}. Conservative shell fallback applies.`,
        liveReadStatus: LIVE_READ_STATUS.FAILED,
        liveReadConfigured: true,
        timeoutMs: config.timeoutMs,
      });
    }
    const payload = await response.json();
    if (payload?.matched === false) {
      return makeResult({
        available: true,
        checked: true,
        reason: payload.reason || "Live NVB authority read completed with no match. Conservative shell fallback applies.",
        liveReadStatus: LIVE_READ_STATUS.UNMATCHED,
        liveReadConfigured: true,
        timeoutMs: config.timeoutMs,
      });
    }
    const record = normaliseLiveRecord(pickRecord(payload, subject.email), subject.email);
    if (!record) {
      return makeResult({
        available: true,
        checked: true,
        reason: "Live NVB authority read returned no usable authority record. Conservative shell fallback applies.",
        liveReadStatus: LIVE_READ_STATUS.UNMATCHED,
        liveReadConfigured: true,
        timeoutMs: config.timeoutMs,
      });
    }
    return makeResult({
      available: true,
      checked: true,
      matched: true,
      recordId: record.recordId,
      confidence: record.confidence,
      record,
      reason: payload.reason || "Live NVB authority record matched through read-only adapter.",
      liveReadStatus: LIVE_READ_STATUS.SUCCESS,
      liveReadConfigured: true,
      timeoutMs: config.timeoutMs,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return makeResult({
      available: true,
      checked: true,
      reason: timedOut
        ? "Live NVB authority read timed out. Conservative shell fallback applies."
        : `Live NVB authority read failed: ${error?.message || "unknown error"}. Conservative shell fallback applies.`,
      liveReadStatus: timedOut ? LIVE_READ_STATUS.TIMEOUT : LIVE_READ_STATUS.FAILED,
      liveReadConfigured: true,
      timeoutMs: config.timeoutMs,
    });
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

export function createNvbAuthorityAdapter({ eventBus } = {}) {
  const state = {
    owner: "shell",
    pending: null,
    pendingKey: null,
    lastResult: null,
    lastSubjectKey: null,
    lastResolvedAtMs: 0,
  };

  function setResult(subjectKey, result, reason) {
    state.lastSubjectKey = subjectKey;
    state.lastResult = result;
    state.lastResolvedAtMs = Date.now();
    eventBus?.emit("authority:live-read-completed", { reason, subjectKey, result: clone(result) });
  }

  function startRead(config, subject, subjectKey) {
    if (state.pending && state.pendingKey === subjectKey) return;
    state.pendingKey = subjectKey;
    state.pending = readLiveAuthority(config, subject).then((result) => {
      setResult(subjectKey, result, result.liveReadStatus);
      return result;
    }).finally(() => {
      state.pending = null;
      state.pendingKey = null;
    });
  }

  return {
    owner: "shell",
    status: "live-read-adapter-ready",
    source: "live-nvb-read",
    liveReadStatus: LIVE_READ_STATUS.UNAVAILABLE,
    writePolicy: {
      enabled: false,
      reason: "NVB authority adapter is read-only. Role, privilege, blacklist, and restriction writes are excluded.",
    },
    resolveAuthority({ auth, identity } = {}) {
      const subject = readSubject({ auth, identity });
      const subjectKey = subject.email || subject.authUserId || "anonymous";
      const config = configSummary(runtimeConfig());

      if (!subject.email) {
        return makeResult({
          available: false,
          checked: false,
          reason: "No authenticated subject email is available for live NVB read. Conservative shell fallback applies.",
          liveReadStatus: LIVE_READ_STATUS.NO_SUBJECT,
          liveReadConfigured: !!config.endpoint,
          timeoutMs: config.timeoutMs,
        });
      }

      if (!config.enabled || !config.endpoint) {
        return makeResult({
          available: false,
          checked: false,
          reason: "Live NVB authority endpoint is not configured in runtime config. Conservative shell fallback applies.",
          liveReadStatus: LIVE_READ_STATUS.UNAVAILABLE,
          liveReadConfigured: false,
          timeoutMs: config.timeoutMs,
        });
      }

      const cacheFresh = state.lastSubjectKey === subjectKey && state.lastResult && Date.now() - state.lastResolvedAtMs < config.ttlMs;
      if (cacheFresh) return clone(state.lastResult);

      startRead(config, subject, subjectKey);
      return makeResult({
        available: true,
        checked: true,
        reason: "Live NVB authority read is pending. Conservative shell fallback applies until it completes.",
        liveReadStatus: LIVE_READ_STATUS.PENDING,
        liveReadConfigured: true,
        timeoutMs: config.timeoutMs,
      });
    },
  };
}

export { LIVE_READ_STATUS as NVB_AUTHORITY_LIVE_READ_STATUS };
