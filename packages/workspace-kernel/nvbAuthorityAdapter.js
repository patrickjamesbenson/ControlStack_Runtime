const SAFE_NVB_AUTHORITY_RECORDS = Object.freeze([
  Object.freeze({
    recordId: "nvb-patrick-benson",
    email: "patrick.james.benson@gmail.com",
    actualRole: "developer",
    confidence: "high",
    specialVisibility: ["workspace:developer-preview", "workspace:visibility:test"],
    exceptionalEntitlements: ["shell:builder-track"],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
  Object.freeze({
    recordId: "nvb-internal-user",
    email: "internal@controlstack.local",
    actualRole: "internal_user",
    confidence: "medium",
    specialVisibility: [],
    exceptionalEntitlements: [],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
  Object.freeze({
    recordId: "nvb-internal-engineer",
    email: "engineer@controlstack.local",
    actualRole: "internal_engineer",
    confidence: "medium",
    specialVisibility: ["workspace:visibility:test"],
    exceptionalEntitlements: [],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
  Object.freeze({
    recordId: "nvb-developer",
    email: "developer@controlstack.local",
    actualRole: "developer",
    confidence: "medium",
    specialVisibility: ["workspace:developer-preview", "workspace:visibility:test"],
    exceptionalEntitlements: ["shell:developer-support"],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
  Object.freeze({
    recordId: "nvb-admin",
    email: "admin@controlstack.local",
    actualRole: "admin",
    confidence: "medium",
    specialVisibility: ["workspace:developer-preview", "workspace:admin-preview", "workspace:visibility:test"],
    exceptionalEntitlements: ["shell:admin-support"],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
  Object.freeze({
    recordId: "nvb-external-client",
    email: "client@example.com",
    actualRole: "external_user",
    confidence: "medium",
    specialVisibility: [],
    exceptionalEntitlements: [],
    restrictions: [],
    blacklist: { active: false, reason: null },
  }),
]);

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createNvbAuthorityAdapter() {
  return {
    owner: "shell",
    status: "read-only-facade-ready",
    source: "safe-nvb-read-only-facade",
    writePolicy: {
      enabled: false,
      reason: "NVB authority adapter is read-only. Role, privilege, blacklist, and restriction writes are excluded.",
    },
    resolveAuthority({ auth, identity } = {}) {
      const email = normaliseEmail(auth?.session?.email || identity?.currentUser?.email || identity?.email);
      const record = SAFE_NVB_AUTHORITY_RECORDS.find((candidate) => normaliseEmail(candidate.email) === email) || null;
      if (!record) {
        return {
          available: true,
          checked: true,
          matched: false,
          source: "safe-nvb-read-only-facade",
          recordId: null,
          resolvedAt: new Date().toISOString(),
          confidence: "none",
          record: null,
          reason: "No NVB authority record matched. Use conservative shell fallback.",
        };
      }
      return {
        available: true,
        checked: true,
        matched: true,
        source: "safe-nvb-read-only-facade",
        recordId: record.recordId,
        resolvedAt: new Date().toISOString(),
        confidence: record.confidence,
        record: clone(record),
        reason: "NVB authority record matched through read-only facade.",
      };
    },
  };
}
