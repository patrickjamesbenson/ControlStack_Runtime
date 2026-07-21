import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  GOVERNANCE_PERMISSION_STATES,
  GOVERNANCE_USER_IDENTITY_SCHEMA_ID,
  GOVERNANCE_USER_ROLES,
  resolveGovernanceUserIdentity,
  resolveGovernanceUserIdentityNvbFirst,
} from "../packages/workspace-kernel/governance/userIdentityPermissionsContract.js";
import { createIdentityService } from "../packages/workspace-kernel/identityService.js";

function authService() {
  return {
    getAuthSnapshot() {
      return {
        owner: "shell",
        status: "signed-out",
        source: "test-auth",
        session: { authenticated: false },
        user: {
          id: "anonymous-visitor",
          name: "Anonymous visitor",
          email: null,
          classification: "anonymous",
          identityState: "external_anonymous",
          actualRole: "external_user",
          company: null,
        },
      };
    },
  };
}

test("NVB is always consulted before HubSpot and NVB owns role authority", async () => {
  const calls = [];
  const resolution = await resolveGovernanceUserIdentityNvbFirst({
    email: "engineer@example.com",
    async lookupNvb(email) {
      calls.push(`nvb:${email}`);
      return {
        userId: "user-1",
        email,
        name: "Engineer One",
        company: "NVB Company",
        role: "internal_engineer",
        roles: null,
        blocked: false,
      };
    },
    async lookupHubspot(email) {
      calls.push(`hubspot:${email}`);
      return {
        contactId: "contact-1",
        email,
        companyId: "company-1",
        dealId: null,
        found: true,
      };
    },
  });

  assert.deepEqual(calls, ["nvb:engineer@example.com", "hubspot:engineer@example.com"]);
  assert.equal(resolution.schemaId, GOVERNANCE_USER_IDENTITY_SCHEMA_ID);
  assert.equal(resolution.source, "nvb");
  assert.equal(resolution.actualRole, "internal_engineer");
  assert.equal(resolution.identityState, "internal_identified");
  assert.equal(resolution.hubspotMatched, true);
  assert.deepEqual(resolution.lookupOrder, ["nvb", "hubspot"]);
  assert.equal(Object.isFrozen(resolution), true);
  assert.equal(Object.isFrozen(resolution.permissions), true);
});

test("permission lifecycle is exact and internal override is flagged and logged", () => {
  const resolution = resolveGovernanceUserIdentity({
    email: "user@example.com",
    nvbRecord: {
      userId: "user-2",
      email: "user@example.com",
      name: "User Two",
      company: "Example",
      role: "internal_user",
      roles: null,
      blocked: false,
    },
    hubspotRecord: null,
    internalOverrideRole: "developer",
    internalOverrideReason: "approved support investigation",
  });

  assert.deepEqual(GOVERNANCE_USER_ROLES, [
    "external_user",
    "internal_user",
    "internal_engineer",
    "developer",
  ]);
  assert.deepEqual(resolution.permissions, {
    view: GOVERNANCE_PERMISSION_STATES.view,
    propose: GOVERNANCE_PERMISSION_STATES.propose,
    handoff: GOVERNANCE_PERMISSION_STATES.handoff,
    locked: GOVERNANCE_PERMISSION_STATES.locked,
    signedOff: GOVERNANCE_PERMISSION_STATES.signedOff,
    internalOverride: {
      enabled: true,
      role: "developer",
      flagged: true,
      logged: true,
      reason: "approved support investigation",
    },
  });
  assert.equal(resolution.resolvedRole, "internal_user");
  assert.equal(resolution.actualRole, "developer");
});

test("HubSpot presence cannot grant an internal role and no match defers leads handling", () => {
  const hubspotOnly = resolveGovernanceUserIdentity({
    email: "external@example.com",
    nvbRecord: null,
    hubspotRecord: {
      contactId: "contact-2",
      email: "external@example.com",
      companyId: null,
      dealId: null,
      found: true,
    },
    internalOverrideRole: null,
    internalOverrideReason: null,
  });
  assert.equal(hubspotOnly.actualRole, "external_user");
  assert.equal(hubspotOnly.source, "hubspot-presence-only");
  assert.equal(hubspotOnly.leadsPipelineDeferred, false);

  const noMatch = resolveGovernanceUserIdentity({
    email: "new@example.com",
    nvbRecord: null,
    hubspotRecord: null,
    internalOverrideRole: null,
    internalOverrideReason: null,
  });
  assert.equal(noMatch.actualRole, "external_user");
  assert.equal(noMatch.source, "no-match");
  assert.equal(noMatch.leadsPipelineDeferred, true);
});

test("identity contract rejects unsafe, widened, mismatched and provider-shaped input", () => {
  for (const input of [
    { email: "not-an-email", nvbRecord: null, hubspotRecord: null },
    { email: "user@example.com", nvbRecord: null, hubspotRecord: null, provider: {} },
    {
      email: "user@example.com",
      nvbRecord: { userId: "user", email: "other@example.com", name: null, company: null, role: "external_user", roles: null, blocked: false },
      hubspotRecord: null,
    },
    {
      email: "user@example.com",
      nvbRecord: { userId: "user", email: "user@example.com", name: "C:\\private", company: null, role: "external_user", roles: null, blocked: false },
      hubspotRecord: null,
    },
    {
      email: "user@example.com",
      nvbRecord: null,
      hubspotRecord: { contactId: "contact", email: "user@example.com", companyId: null, dealId: null, found: true, raw: {} },
    },
  ]) {
    assert.throws(() => resolveGovernanceUserIdentity(input), TypeError);
  }
});

test("identity service exposes the Governance resolution without changing technical readiness", async () => {
  const calls = [];
  const service = createIdentityService({
    authService: authService(),
    async lookupNvb(email) {
      calls.push("nvb");
      return { userId: "user-3", email, name: "User Three", company: "Example", role: "internal_user", roles: null, blocked: false };
    },
    async lookupHubspot(email) {
      calls.push("hubspot");
      return { contactId: "contact-3", email, companyId: null, dealId: null, found: true };
    },
  });

  const result = await service.identifyByEmail("user@example.com");
  assert.equal(result.accepted, true);
  assert.deepEqual(calls, ["nvb", "hubspot"]);
  const snapshot = service.getIdentitySnapshot();
  assert.equal(snapshot.actualRole, "internal_user");
  assert.equal(snapshot.governanceIdentity.actualRole, "internal_user");
  assert.deepEqual(snapshot.permissions, snapshot.governanceIdentity.permissions);
  assert.equal(snapshot.governanceIdentity.engineEligibilityChanged, false);
  assert.equal(snapshot.governanceIdentity.engineInputChanged, false);
  assert.equal(snapshot.governanceIdentity.technicalReadinessChanged, false);
});

test("identity restoration contains no provider write, hard verification, two-factor or Engine seam", async () => {
  const [contractSource, serviceSource] = await Promise.all([
    readFile(new URL("../packages/workspace-kernel/governance/userIdentityPermissionsContract.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/identityService.js", import.meta.url), "utf8"),
  ]);
  const combined = `${contractSource}\n${serviceSource}`;
  for (const prohibited of [
    "hubspot.create",
    "hubspot.update",
    "crmService.write",
    "fetch(",
    "axios",
    "invokeEngine",
    "runEngine",
    "engineEligibility = true",
    "twoFactorEnabled: true",
    "hardEmailVerificationEnabled: true",
  ]) {
    assert.equal(combined.includes(prohibited), false, prohibited);
  }
  assert.match(contractSource, /lookupNvb\(normalisedEmail\)[\s\S]*lookupHubspot\(normalisedEmail\)/);
});
