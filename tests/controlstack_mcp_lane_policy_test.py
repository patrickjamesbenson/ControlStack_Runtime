#!/usr/bin/env python3
"""Self-verification for ControlStack lane policy guards."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools" / "controlstack-mcp" / "controlstack_mcp.py"

os.environ.update({
    "CONTROLSTACK_RUNTIME_ROOT": str(ROOT),
    "CONTROLSTACK_DONOR_REFERENCE_ROOT": str(ROOT / ".disabled-donor-reference"),
    "CONTROLSTACK_LANE_NAME": "policy-test",
    "CONTROLSTACK_REQUIRED_BRANCH": "lane/policy-test",
    "CONTROLSTACK_ALLOWED_WRITE_GLOBS": "packages/workspace-kernel/**;tests/selector*.test.js",
    "CONTROLSTACK_ALLOWED_GATES": "tooling-policy",
    "CONTROLSTACK_ENABLE_WRITE": "1",
    "CONTROLSTACK_ENABLE_GIT_STAGE": "1",
    "CONTROLSTACK_ENABLE_GIT_COMMIT": "1",
    "CONTROLSTACK_ENABLE_GIT_PUSH": "1",
    "CONTROLSTACK_ENABLE_DESTRUCTIVE": "0",
    "CONTROLSTACK_ENABLE_CROSS_ROOT_COPY": "0",
})

spec = importlib.util.spec_from_file_location("controlstack_mcp_lane_policy", SOURCE)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load ControlStack MCP source.")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module._run_git = lambda *args, **kwargs: {"ok": True, "stdout": "lane/policy-test\n"}
assert module._require_lane_branch() == "lane/policy-test"
assert module._path_in_write_scope("packages/workspace-kernel/example.js")
assert module._path_in_write_scope("tests/selectorExample.test.js")
assert not module._path_in_write_scope("packages/lab-kernel/ies-toolkit/example.js")
assert module._require_scoped_paths(["packages/workspace-kernel/example.js"]) == [
    "packages/workspace-kernel/example.js"
]

try:
    module._require_scoped_paths(["packages/lab-kernel/ies-toolkit/example.js"])
except PermissionError:
    pass
else:
    raise AssertionError("Out-of-scope write was not rejected.")

module._run_git = lambda *args, **kwargs: {"ok": True, "stdout": "main\n"}
try:
    module._require_lane_branch(for_push=True)
except PermissionError:
    pass
else:
    raise AssertionError("A main-branch mutation was not rejected.")

for guard in (module._require_destructive_enabled, module._require_cross_root_copy_enabled):
    try:
        guard()
    except PermissionError:
        pass
    else:
        raise AssertionError(f"Disabled guard unexpectedly passed: {guard.__name__}")

assert module.ALLOWED_GATES == {"tooling-policy"}
assert module.ENABLE_WRITE is True
assert module.ENABLE_GIT_STAGE is True
assert module.ENABLE_GIT_COMMIT is True
assert module.ENABLE_GIT_PUSH is True
assert module.ENABLE_DESTRUCTIVE is False
assert module.ENABLE_CROSS_ROOT_COPY is False

print("ControlStack MCP lane policy: PASS")
