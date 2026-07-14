from __future__ import annotations

import importlib.util
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Mapping

sys.dont_write_bytecode = True
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

BRIDGE_SCHEMA_ID = "controlstack.runtime.engine-runtable.selected-project-host-seam-bridge.v1"
BRIDGE_SCHEMA_VERSION = 1
BRIDGE_FIELD_ORDER = [
    "schemaId",
    "schemaVersion",
    "selectorPayload",
    "execute",
    "filesystemWriteGuardRequired",
    "bytecodeWritingDisabled",
]
MAX_STDIN_BYTES = 256 * 1024
MCP_SOURCE_PATH = Path(__file__).resolve().parents[1] / "controlstack-mcp" / "controlstack_mcp.py"
FORBIDDEN_KEY_PATTERN = re.compile(
    r"^(?:db|database|databasePath|dbPath|filePath|sourcePath|privatePath|runtimeData|projectEnvelope|engineOptions|options)$",
    re.IGNORECASE,
)
PRIVATE_PATH_VALUE_PATTERN = re.compile(
    r"(?:^[A-Za-z]:[\\/]|^\\\\|^[\\/]Users[\\/]|^[\\/]home[\\/]|^[\\/]mnt[\\/]|^file:)",
    re.IGNORECASE,
)


def safe_failure(code: str) -> dict[str, Any]:
    return {
        "ok": False,
        "seam": "engine-runtable-internal-readonly-invoke",
        "seam_version": "engine_runtable_internal_readonly_invoke.v1",
        "internal_mcp_diagnostic_only": True,
        "server_side_only": True,
        "public_route_added": False,
        "post_endpoint_added": False,
        "caller_supplied_file_path_allowed": False,
        "caller_supplied_db_allowed": False,
        "active_source_db_loaded_read_only": False,
        "active_source_db_passed_in_memory_only": False,
        "donor_run_engine_attempted": False,
        "donor_bridge_used": False,
        "donor_bridge_audit_jsonl_write_enabled": False,
        "filesystem_write_guard_active": True,
        "bytecode_writing_disabled": True,
        "audit_jsonl_write_attempted": False,
        "write_attempted": False,
        "filesystem_write_attempted": False,
        "runtime_data_mutation_enabled": False,
        "runtime_data_mutated": False,
        "donor_data_mutation_enabled": False,
        "selected_result_persistence_enabled": False,
        "selected_result_persisted": False,
        "run_table_generated": False,
        "ies_generated": False,
        "output_generated": False,
        "engine_execution_attempted": False,
        "engine_result_produced": False,
        "selected_result_created": False,
        "synthetic_success_fixture_created": False,
        "product_data_invented": False,
        "raw_rows_exposed": False,
        "raw_headers_exposed": False,
        "raw_users_exposed": False,
        "raw_snapshot_returned": False,
        "raw_snapshot_serialized": False,
        "raw_engine_payload_exposed": False,
        "raw_engine_debug_payload_exposed": False,
        "raw_rough_electrical_payload_exposed": False,
        "raw_ies_exposed": False,
        "raw_candela_exposed": False,
        "raw_lab_evidence_exposed": False,
        "raw_pdfs_exposed": False,
        "base64_artifacts_exposed": False,
        "credentials_exposed": False,
        "provider_ids_exposed": False,
        "private_paths_exposed": False,
        "source_path_returned": False,
        "safe_engine_summary": None,
        "blockers": [{
            "code": code,
            "severity": "blocking",
            "reason": "Host-local readonly seam invocation was blocked fail-closed.",
        }],
        "warnings": [],
    }


def find_forbidden_value(value: Any, depth: int = 0) -> str | None:
    if depth > 30:
        return "host-bridge-candidate-depth-invalid"
    if isinstance(value, str):
        return "host-bridge-private-path-refused" if PRIVATE_PATH_VALUE_PATTERN.search(value) else None
    if value is None or isinstance(value, (bool, int, float)):
        return None
    if isinstance(value, list):
        for nested in value:
            blocker = find_forbidden_value(nested, depth + 1)
            if blocker:
                return blocker
        return None
    if not isinstance(value, Mapping):
        return "host-bridge-non-json-value-refused"
    for key, nested in value.items():
        if FORBIDDEN_KEY_PATTERN.match(str(key)):
            return f"host-bridge-forbidden-key-{key}"
        blocker = find_forbidden_value(nested, depth + 1)
        if blocker:
            return blocker
    return None


def read_bridge_request() -> tuple[dict[str, Any] | None, str | None]:
    if len(sys.argv) != 1:
        return None, "host-bridge-command-line-input-refused"
    raw = sys.stdin.buffer.read(MAX_STDIN_BYTES + 1)
    if len(raw) > MAX_STDIN_BYTES:
        return None, "host-bridge-input-too-large"
    try:
        parsed = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "host-bridge-json-invalid"
    if not isinstance(parsed, dict) or list(parsed.keys()) != BRIDGE_FIELD_ORDER:
        return None, "host-bridge-request-shape-invalid"
    if parsed.get("schemaId") != BRIDGE_SCHEMA_ID or parsed.get("schemaVersion") != BRIDGE_SCHEMA_VERSION:
        return None, "host-bridge-request-schema-mismatch"
    if (parsed.get("execute") is not True
            or parsed.get("filesystemWriteGuardRequired") is not True
            or parsed.get("bytecodeWritingDisabled") is not True
            or not isinstance(parsed.get("selectorPayload"), dict)):
        return None, "host-bridge-request-contract-invalid"
    blocker = find_forbidden_value(parsed["selectorPayload"])
    return (None, blocker) if blocker else (parsed, None)


def load_internal_seam_module() -> Any:
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location(
        "controlstack_runtime_selected_project_host_seam",
        MCP_SOURCE_PATH,
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("host-seam-module-spec-unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    request, blocker = read_bridge_request()
    if blocker:
        print(json.dumps(safe_failure(blocker), separators=(",", ":")))
        return 0
    try:
        module = load_internal_seam_module()
        result = module.engine_runtable_internal_readonly_invoke_probe(
            selector_payload=request["selectorPayload"],
            execute=True,
        )
        if not isinstance(result, dict):
            result = safe_failure("host-seam-result-invalid")
    except Exception:  # noqa: BLE001 - no exception or private path is returned
        result = safe_failure("host-seam-invocation-failed")
    print(json.dumps(result, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
