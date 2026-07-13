import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeamAdapter,
  createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";

function transportRequest(selectedProjectId, overrides = {}) {
  return {
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    requestKind: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
    selectedProjectId,
    readOnly: true,
    selectedProjectOnly: true,
    ...overrides,
  };
}

function adapterRequest(selectorPayload) {
  return Object.freeze({
    seam: "engine-runtable-internal-readonly-invoke",
    selectorPayload: Object.freeze(selectorPayload),
    execute: true,
    candidatePayloadReturned: false,
    callerSuppliedDbAllowed: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
  });
}

test("exports one fixed loopback host transport mount contract without mounting the browser shell", () => {
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
    "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-HOST-TRANSPORT-MOUNT-1",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
    "/api/workspace-shell/selected-project-engine-readonly-invoke",
  );
  assert.equal(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
    "POST",
  );

  const mount = createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount();
  assert.equal(Object.isFrozen(mount), true);
  assert.equal(mount.serverSide, true);
  assert.equal(mount.hostLocal, true);
  assert.equal(mount.readOnly, true);
  assert.equal(mount.selectedProjectOnly, true);
  assert.equal(mount.redactedOutcomeOnly, true);
  assert.equal(mount.shellMounted, false);
  assert.equal(mount.routesAdded, true);
  assert.equal(mount.postEndpointsAdded, true);
  for (const key of [
    "candidatePayloadAcceptedFromCaller",
    "filePathAcceptedFromCaller",
    "databaseAcceptedFromCaller",
    "sourcePathAcceptedFromCaller",
    "projectEnvelopeAcceptedFromCaller",
    "engineOptionsAcceptedFromCaller",
  ]) {
    assert.equal(mount[key], false, key);
  }
});

test("real host-local adapter forwards only the private candidate through the fixed internal bridge contract", async () => {
  let received = null;
  const adapter = createRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeamAdapter({
    invokeHostLocalReadonlySeam(request) {
      received = request;
      return { ok: false, safe: true };
    },
  });
  const selectorPayload = {
    host_local_readonly_engine_candidate: true,
    selector_stage3_supported_subset: true,
    tier: "Business",
    runs: [{ qty: 2, run_length_mm: 3500 }],
    lighting: { target_lm_per_m: "1200" },
  };

  const result = await adapter.invoke(adapterRequest(selectorPayload));

  assert.deepEqual(result, { ok: false, safe: true });
  assert.ok(received);
  assert.equal(Object.isFrozen(received), true);
  assert.deepEqual(Object.keys(received), [
    "schemaId",
    "schemaVersion",
    "selectorPayload",
    "execute",
  ]);
  assert.equal(
    received.schemaId,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_ID,
  );
  assert.equal(
    received.schemaVersion,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_VERSION,
  );
  assert.equal(received.execute, true);
  assert.deepEqual(received.selectorPayload, selectorPayload);
  assert.notEqual(received.selectorPayload, selectorPayload);
  for (const forbidden of [
    "db",
    "database",
    "filePath",
    "sourcePath",
    "projectEnvelope",
    "engineOptions",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(received, forbidden), false, forbidden);
  }
});

test("host-local adapter refuses database, path, envelope, and Engine option material before the real seam runner", async () => {
  let calls = 0;
  const adapter = createRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeamAdapter({
    invokeHostLocalReadonlySeam() {
      calls += 1;
      return {};
    },
  });

  for (const selectorPayload of [
    { db: {} },
    { databasePath: "private" },
    { filePath: "candidate.json" },
    { sourcePath: "source.json" },
    { projectEnvelope: {} },
    { engineOptions: { debug: true } },
    { nested: { runtimeData: {} } },
  ]) {
    await assert.rejects(
      adapter.invoke(adapterRequest(selectorPayload)),
      /selected-project-host-transport-forbidden-key/,
    );
  }
  assert.equal(calls, 0);
});

test("mounted transport accepts only the fixed shell request and reports the host route without leaking or invoking on malformed input", async () => {
  let reads = 0;
  let seamCalls = 0;
  const mount = createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount({
    savedProjects: {
      getProjectEnvelope() {
        reads += 1;
        return null;
      },
    },
    invokeHostLocalReadonlySeam() {
      seamCalls += 1;
      return {};
    },
  });

  const malformed = await mount.invoke(transportRequest("env-host-mount", {
    candidate: { tier: "Business" },
  }));
  assert.equal(malformed.requestAccepted, false);
  assert.equal(malformed.ok, false);
  assert.equal(malformed.routesAdded, true);
  assert.equal(malformed.postEndpointsAdded, true);
  assert.equal(malformed.shellMounted, false);
  assert.equal(reads, 0);
  assert.equal(seamCalls, 0);

  const missing = await mount.invoke(transportRequest("env-host-mount"));
  assert.equal(
    missing.state,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.blockedFailClosed,
  );
  assert.equal(missing.requestAccepted, true);
  assert.equal(missing.ok, false);
  assert.equal(missing.routesAdded, true);
  assert.equal(missing.postEndpointsAdded, true);
  assert.equal(missing.candidatePayloadReturned, false);
  assert.equal(missing.projectEnvelopeReturned, false);
  assert.equal(reads, 1);
  assert.equal(seamCalls, 0);
});

test("server mount is loopback-only, fixed-path, process-local, and shell-unmounted", async () => {
  const [mountSource, bridgeSource, serverSource, shellSource, servicesSource] = await Promise.all([
    readFile(
      new URL(
        "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../tools/runtime/engine_runtable_selected_project_readonly_host_adapter.py",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/workspace-kernel/services.js", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(
    mountSource,
    /node:child_process|node:fs|writeFile|appendFile|fetch\s*\(|XMLHttpRequest|WebSocket|webhook/,
  );
  assert.match(serverSource, /isLoopbackRemoteAddress/);
  assert.match(serverSource, /spawn\(/);
  assert.match(serverSource, /requestJson\(req, \{ maxBytes: 8192 \}\)/);
  assert.match(
    serverSource,
    /createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount/,
  );
  assert.match(
    serverSource,
    /engine_runtable_selected_project_readonly_host_adapter\.py/,
  );
  assert.doesNotMatch(serverSource, /engine_runtable_internal_readonly_invoke_probe/);

  assert.match(bridgeSource, /engine_runtable_internal_readonly_invoke_probe/);
  assert.match(bridgeSource, /MCP_SOURCE_PATH/);
  assert.match(bridgeSource, /len\(sys\.argv\) != 1/);
  assert.match(bridgeSource, /sys\.stdin\.buffer\.read/);
  assert.doesNotMatch(bridgeSource, /argparse|add_argument|write_text|write_bytes|open\([^)]*["']w/);

  const browserOwnedSource = `${shellSource}\n${servicesSource}`;
  assert.doesNotMatch(
    browserOwnedSource,
    /selected-project-engine-readonly-invoke|engineRunTableSelectedProjectShellInvokeHostTransportMount|engine_runtable_selected_project_readonly_host_adapter|spawn\s*\(|fetch\s*\(/,
  );
});
