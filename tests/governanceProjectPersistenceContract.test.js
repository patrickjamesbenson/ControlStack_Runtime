import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWorkspaceSavedProjectRecord,
  isWorkspaceFixtureProjectId,
  migrateWorkspaceSavedProjectRecord,
  normaliseWorkspaceSavedProjectRecord,
  validateWorkspaceProjectId,
  workspaceSavedProjectCacheKey,
  WORKSPACE_SAVED_PROJECT_FIELD_ORDER,
  WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
  WORKSPACE_SAVED_PROJECT_SCHEMA_ID,
  WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION,
} from "../packages/workspace-kernel/governance/projectPersistenceContract.js";

function envelope(projectId = "project-one", overrides = {}) {
  const savedAt = "2026-07-21T12:00:00.000Z";
  return {
    schema: WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
    owner: "shell",
    source: "test",
    browserOnly: false,
    readOnly: false,
    envelopeId: `env-${projectId}-one`,
    projectId,
    title: "Project One",
    client: "Client One",
    site: "Sydney",
    createdAt: savedAt,
    updatedAt: savedAt,
    savedAt,
    savedBy: {},
    project: {
      metadata: { projectId, title: "Project One" },
      currentProject: { projectId, title: "Project One", client: "Client One", site: "Sydney" },
      selection: {},
    },
    shell: { phase: "test", contractVersion: "test", visibility: {}, flags: {}, downstream: {} },
    modules: {},
    lifecycle: { owner: "shell", status: "draft", custody: {}, handoff: {} },
    restore: {},
    ...overrides,
  };
}

test("canonical persisted project record is exact, immutable and preserves passive CRM links", () => {
  const record = buildWorkspaceSavedProjectRecord({
    envelope: envelope(),
    hubspotDealId: "deal-123",
    hubspotContactId: "contact-456",
    hubspotCompanyId: "company-789",
  });

  assert.deepEqual(Object.keys(record), WORKSPACE_SAVED_PROJECT_FIELD_ORDER);
  assert.equal(record.schemaId, WORKSPACE_SAVED_PROJECT_SCHEMA_ID);
  assert.equal(record.schemaVersion, WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION);
  assert.equal(record.projectId, "project-one");
  assert.equal(record.envelope.projectId, record.projectId);
  assert.equal(record.envelope.envelopeId, record.envelopeId);
  assert.equal(record.hubspotDealId, "deal-123");
  assert.equal(record.hubspotContactId, "contact-456");
  assert.equal(record.hubspotCompanyId, "company-789");
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.envelope), true);
  assert.deepEqual(normaliseWorkspaceSavedProjectRecord(record), record);
});

test("stable project identity is lowercase, path-safe and excludes fixture truth", () => {
  assert.equal(validateWorkspaceProjectId("real-project_01"), "real-project_01");
  assert.equal(workspaceSavedProjectCacheKey("real-project_01"), "workspace_saved_project.v2:real-project_01");
  for (const value of [
    "Project-One",
    "../project-one",
    "project/one",
    "project one",
    "",
    "saved-alpha",
    "saved-bravo",
    "saved-charlie",
    "project-alpha",
    "project-bravo",
    "project-charlie",
  ]) {
    assert.throws(() => validateWorkspaceProjectId(value), TypeError, value);
  }
  assert.equal(isWorkspaceFixtureProjectId("saved-alpha"), true);
});

test("request, record and envelope identity must agree", () => {
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  assert.throws(
    () => normaliseWorkspaceSavedProjectRecord(record, { expectedProjectId: "project-two" }),
    /project-id-mismatch/,
  );
  assert.throws(
    () => normaliseWorkspaceSavedProjectRecord({
      ...record,
      envelope: { ...record.envelope, projectId: "project-two" },
    }),
    /envelope-identity-mismatch/,
  );
  assert.throws(
    () => normaliseWorkspaceSavedProjectRecord({ ...record, provider: {} }),
    /fields-invalid/,
  );
});

test("runtime schema is never silently treated as persisted schema", () => {
  assert.throws(
    () => migrateWorkspaceSavedProjectRecord({
      schemaId: WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID,
      projectId: "project-one",
    }),
    /requires-explicit-adapter/,
  );
});

test("donor v1 migration is explicit, versioned and keeps passive CRM links", () => {
  const migrated = migrateWorkspaceSavedProjectRecord({
    schemaId: "workspace_saved_project.v1",
    version: 1,
    job_id: "project-one",
    hubspot_deal_id: "deal-123",
    hubspot_contact_id: "contact-456",
    hubspot_company_id: "company-789",
  }, {
    createEnvelopeFromDonorV1(_donor, projectId) {
      return envelope(projectId);
    },
  });
  assert.equal(migrated.schemaId, WORKSPACE_SAVED_PROJECT_SCHEMA_ID);
  assert.equal(migrated.projectId, "project-one");
  assert.equal(migrated.hubspotDealId, "deal-123");
  assert.equal(migrated.hubspotContactId, "contact-456");
  assert.equal(migrated.hubspotCompanyId, "company-789");
});

test("paths, URLs and provider-shaped records are rejected", () => {
  assert.throws(
    () => buildWorkspaceSavedProjectRecord({ envelope: envelope("project-one", { title: "C:\\private\\project" }) }),
    /title-unsafe/,
  );
  assert.throws(
    () => buildWorkspaceSavedProjectRecord({ envelope: envelope("project-one", { site: "https://example.invalid" }) }),
    /site-unsafe/,
  );
  const record = buildWorkspaceSavedProjectRecord({ envelope: envelope() });
  assert.throws(
    () => normaliseWorkspaceSavedProjectRecord({ ...record, provider: "hubspot" }),
    /fields-invalid/,
  );
});
