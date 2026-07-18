import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const runtimeRoot = fileURLToPath(new URL("..", import.meta.url));
const LOGODEV_TEST_KEY = "pk_logodev_status_regression_sentinel";

async function waitForServer(baseUrl, child) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`logo-dev-test-server-exited-${child.exitCode}`);
    try {
      const response = await fetch(new URL("/health", baseUrl));
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("logo-dev-test-server-start-timeout");
}

async function withRuntime({ port, logoDevPublishableKey }, callback) {
  const env = {
    ...process.env,
    CONTROLSTACK_RUNTIME_HOST: "127.0.0.1",
    CONTROLSTACK_RUNTIME_PORT: String(port),
  };
  delete env.LOGODEV_PUBLISHABLE_KEY;
  if (logoDevPublishableKey) env.LOGODEV_PUBLISHABLE_KEY = logoDevPublishableKey;

  const child = spawn(process.execPath, ["server.js"], {
    cwd: runtimeRoot,
    windowsHide: true,
    stdio: ["ignore", "ignore", "pipe"],
    env,
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(baseUrl, child);
    await callback(baseUrl);
  } finally {
    child.kill();
    await new Promise((resolve) => child.once("close", resolve));
  }
  assert.equal(stderr.includes("EADDRINUSE"), false, stderr);
}

function logoDevStatus(status) {
  return status.runtimeConfigBridge.companyIdentity.logoDevPublishableKey;
}

test("Logo.dev runtime status reports missing configuration without exposing a value", async () => {
  const port = 35000 + (process.pid % 10000);
  await withRuntime({ port, logoDevPublishableKey: null }, async (baseUrl) => {
    const statusResponse = await fetch(new URL("/api/runtime-config/status", baseUrl));
    assert.equal(statusResponse.ok, true);
    const status = await statusResponse.json();
    const logoDev = logoDevStatus(status);

    assert.equal(logoDev.primary, "LOGODEV_PUBLISHABLE_KEY");
    assert.equal(logoDev.configured, false);
    assert.equal(logoDev.secret, true);
    assert.equal(logoDev.browserSensitive, true);
    assert.equal(logoDev.valueKind, "browser-publishable-logo-dev-key");

    const runtimeConfigResponse = await fetch(new URL("/runtime-config.js", baseUrl));
    assert.equal(runtimeConfigResponse.ok, true);
    const runtimeConfigBody = await runtimeConfigResponse.text();
    assert.match(runtimeConfigBody, /"logoDevPublishableKey": ""/);
  });
});

test("Logo.dev runtime status reports configured with redaction while browser config retains the publishable key", async () => {
  const port = 45000 + (process.pid % 10000);
  await withRuntime({ port, logoDevPublishableKey: LOGODEV_TEST_KEY }, async (baseUrl) => {
    const statusResponse = await fetch(new URL("/api/runtime-config/status", baseUrl));
    assert.equal(statusResponse.ok, true);
    const statusBody = await statusResponse.text();
    const status = JSON.parse(statusBody);
    const logoDev = logoDevStatus(status);

    assert.equal(logoDev.primary, "LOGODEV_PUBLISHABLE_KEY");
    assert.equal(logoDev.activeName, "LOGODEV_PUBLISHABLE_KEY");
    assert.equal(logoDev.configured, true);
    assert.equal(logoDev.secret, true);
    assert.equal(logoDev.browserSensitive, true);
    assert.equal(logoDev.browserVisibleValue, "redacted");
    assert.equal(logoDev.valueKind, "browser-publishable-logo-dev-key");
    assert.equal(statusBody.includes(LOGODEV_TEST_KEY), false);

    const runtimeConfigResponse = await fetch(new URL("/runtime-config.js", baseUrl));
    assert.equal(runtimeConfigResponse.ok, true);
    const runtimeConfigBody = await runtimeConfigResponse.text();
    assert.match(runtimeConfigBody, /"companyIdentity": \{/);
    assert.equal(runtimeConfigBody.includes(LOGODEV_TEST_KEY), true);
  });
});
