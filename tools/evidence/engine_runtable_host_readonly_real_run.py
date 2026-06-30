from __future__ import annotations

"""Host-local read-only Engine / RunTable evidence runner.

This script bypasses ChatGPT tool-schema exposure by importing the already
committed internal MCP seam directly from local source. It is host-local only:
it does not register routes, does not add POST endpoints, does not accept a
caller-supplied db/path, and writes only redacted evidence reports under the
runtime repo's ignored _worker_reports folder.
"""

import argparse
import importlib.util
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

STAGE_NAME = "ENGINE-RUNTABLE-SOURCE-LIGHTING-FIELD-DERIVATION-1"
SCRIPT_PATH = Path(__file__).resolve()
RUNTIME_ROOT = SCRIPT_PATH.parents[2]
MCP_SOURCE_PATH = RUNTIME_ROOT / "tools" / "controlstack-mcp" / "controlstack_mcp.py"
REPORT_DIR = RUNTIME_ROOT / "_worker_reports"
STAGE_REPORT_PATH = REPORT_DIR / f"{STAGE_NAME}.json"
LATEST_REPORT_PATH = REPORT_DIR / "latest_engine_runtable_host_readonly_real_run.json"

CONTROLLED_RUN = {
    "Run": "host-local-readonly-evidence-run-1",
    "Qty": 1,
    "run_length_mm": 1200,
    "reserved_ranges": [],
}

RAW_EXPOSURE_CHECKS = {
    "raw_rows_exposed": False,
    "raw_headers_exposed": False,
    "raw_users_exposed": False,
    "raw_user_headers_exposed": False,
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
}

ROUTE_POST_CHECKS = {
    "host_local_only": True,
    "public_route_added": False,
    "post_endpoint_added": False,
    "browser_run_button_added": False,
    "selected_result_persistence_enabled": False,
    "selected_result_created": False,
    "synthetic_success_fixture_created": False,
    "ies_generation_enabled": False,
    "lab_proof_authority": False,
    "hubspot_sync_enabled": False,
    "runtime_data_mutation_enabled": False,
    "donor_data_mutation_enabled": False,
    "controlled_records_mutation_enabled": False,
    "rreg_workflow_enabled": False,
}

DISALLOWED_ARG_PREFIXES = (
    "--db",
    "--source-db",
    "--source_path",
    "--source-path",
    "--runtime-data-path",
    "--snapshot",
    "--payload",
    "--selector-payload",
)

REQUIRED_CANDIDATE_FIELDS = (
    "tier",
    "runs",
    "lighting",
    "target_lm_per_m",
    "cct",
    "cri",
    "optic",
    "control_type",
)

FIELD_ALIAS_GROUPS = {
    "lm_per_m": (
        "target_lm_per_m",
        "targetLmPerM",
        "board_lm_per_m",
        "delivered_lm_per_m",
        "lumens_per_m",
        "LUMENS_PER_M",
        "lumens per m",
        "lumens per metre",
        "lumens per meter",
        "lm_per_m",
        "lm/m",
        "lm per m",
        "output_per_m",
        "output per m",
        "nominal_lm_per_m",
        "direct_lm_per_m",
    ),
    "cct": (
        "cct",
        "CCT",
        "c1_cct",
        "c2_cct",
        "cct_k",
        "cct kelvin",
        "colour_temperature",
        "color_temperature",
        "colour temperature",
        "color temperature",
        "kelvin",
        "led_cct",
        "cct_cri",
        "CCT_CRI",
    ),
    "cri": (
        "cri",
        "CRI",
        "c1_cri_min",
        "c2_cri_min",
        "cri_min",
        "cri rating",
        "cri_rating",
        "ra",
        "cct_cri",
        "CCT_CRI",
    ),
    "optic": (
        "optic",
        "optic_key",
        "optic_name",
        "optic_var_1",
        "optic var 1",
        "directOpticVar1",
        "diffuser",
        "diffuser_var_1",
        "diffuser var 1",
        "diffuserVar1",
        "lens",
        "lens_type",
        "optical_code",
        "optic_bom_id",
        "baseline_slug",
        "pure_ref_id",
        "spec_code",
        "name",
        "label",
    ),
    "control_type": (
        "control_type_labels",
        "control_type_options",
        "native_control_type",
        "control_type",
        "control type",
        "control",
        "protocol",
        "control_protocol",
        "driver_control",
        "dimming",
        "dimming_type",
        "driver_type",
    ),
    "system": (
        "system",
        "series",
        "system_name",
        "system_key",
        "profile_family",
        "prepend_d",
        "family",
        "profile",
    ),
    "pitch": ("pitch_mm", "pitch", "board_pitch", "led_pitch_mm"),
    "current_ma": ("test_ma", "current_ma", "c1_test_ma", "c1_imin_ma", "imin_ma", "nominal_current_ma"),
    "direction": ("light_direction", "direction", "light_type", "application", "emission", "optic_direction"),
    "approval": ("approved", "is_approved", "approval", "status", "state"),
    "optic_eff": ("eff_optical", "optical_eff", "optical_efficiency", "optic_eff", "eff", "bclt"),
    "lumen_formula": (
        "c1_lumen_imax_25c",
        "c2_lumen_imax_25c",
        "length_mm",
        "board_length_mm",
        "c1_imax_ma",
        "c2_imax_ma",
    ),
}

SCHEMA_INTROSPECTION_TABLES = ("BOARDS", "OPTICS", "DRIVERS", "SYSTEM_POLICY")
SCHEMA_INTROSPECTION_GROUPS = (
    "lm_per_m",
    "cct",
    "cri",
    "optic",
    "control_type",
    "system",
    "pitch",
    "current_ma",
    "direction",
    "approval",
    "optic_eff",
    "lumen_formula",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def refuse_caller_supplied_db(argv: list[str]) -> None:
    for arg in argv:
        lowered = str(arg).strip().lower()
        if any(lowered == prefix or lowered.startswith(f"{prefix}=") for prefix in DISALLOWED_ARG_PREFIXES):
            raise SystemExit(
                json.dumps(
                    {
                        "ok": False,
                        "stage": STAGE_NAME,
                        "blocked": True,
                        "blockers": [
                            {
                                "code": "caller-supplied-source-or-payload-refused",
                                "severity": "blocking",
                                "reason": "This host-local runner derives from the approved active RuntimeData source only and refuses caller-supplied db, path, snapshot, or payload input.",
                            }
                        ],
                        "caller_supplied_db_allowed": False,
                        **RAW_EXPOSURE_CHECKS,
                        **ROUTE_POST_CHECKS,
                    },
                    indent=2,
                    sort_keys=True,
                )
            )


def safe_blocker(code: str, reason: str, severity: str = "blocking") -> dict[str, Any]:
    return {"code": code, "severity": severity, "reason": reason}


def safe_string(value: Any) -> str:
    return str(value or "").strip()


def is_mapping(value: Any) -> bool:
    return isinstance(value, Mapping)


def truthy(value: Any) -> bool:
    return safe_string(value).upper() in {"TRUE", "YES", "Y", "1", "T", "APPROVED", "ACTIVE", "LIVE", "CURRENT", "RELEASED", "OK"} or value is True


def explicitly_false(value: Any) -> bool:
    return safe_string(value).upper() in {"FALSE", "NO", "N", "0", "F", "INACTIVE", "OBSOLETE", "RETIRED"} or value is False


def normalise_field_name(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", safe_string(value).lower())


def alias_keys(group: str) -> tuple[str, ...]:
    return tuple(FIELD_ALIAS_GROUPS.get(group, ()))


def first_present(mapping: Mapping[str, Any], keys: tuple[str, ...] | list[str]) -> tuple[Any, str | None]:
    for key in keys:
        if key in mapping and mapping.get(key) not in (None, "", [], {}):
            return mapping.get(key), key
    lower_lookup: dict[str, str] = {}
    normalised_lookup: dict[str, str] = {}
    for existing_key in mapping.keys():
        existing_key_text = safe_string(existing_key)
        lower_lookup[existing_key_text.lower()] = existing_key
        normalised_lookup[normalise_field_name(existing_key_text)] = existing_key
    for key in keys:
        actual = lower_lookup.get(safe_string(key).lower()) or normalised_lookup.get(normalise_field_name(key))
        if actual and mapping.get(actual) not in (None, "", [], {}):
            return mapping.get(actual), actual
    return None, None


def split_first(value: Any) -> str:
    raw = safe_string(value)
    if not raw:
        return ""
    parts = re.split(r"\s*(?:[,;/|]|\bor\b)\s*", raw, maxsplit=1, flags=re.IGNORECASE)
    return safe_string(parts[0] if parts else raw)


def numeric_token(value: Any) -> str:
    match = re.search(r"[-+]?\d+(?:\.\d+)?", safe_string(value))
    return match.group(0) if match else ""


def normalise_cct(value: Any) -> str:
    raw = safe_string(value)
    if not raw:
        return ""

    tw = re.search(r"\bTW[_\s-]*(\d{4})[_\s-]*(\d{4})\b", raw, flags=re.IGNORECASE)
    if tw:
        warm = tw.group(1)
        cool = tw.group(2)
        return f"TW_{min(warm, cool)}_{max(warm, cool)}"

    range_match = re.search(
        r"\b((?:22|27|30|35|40|50|57|60|65)00)\s*(?:K)?\s*(?:-|–|—|to)\s*((?:22|27|30|35|40|50|57|60|65)00)\s*K?\b",
        raw,
        flags=re.IGNORECASE,
    )
    if range_match:
        first = range_match.group(1)
        second = range_match.group(2)
        return f"TW_{min(first, second)}_{max(first, second)}"

    parts = re.split(r"\s*(?:[,;/|]|\bor\b)\s*", raw, flags=re.IGNORECASE)
    for part in parts:
        match = re.search(r"\b(?:22|27|30|35|40|50|57|60|65)00\s*K?\b", safe_string(part), flags=re.IGNORECASE)
        if match:
            digits = re.sub(r"\D", "", match.group(0))
            return f"{digits}K" if digits else ""
    return ""


def normalise_cri(value: Any) -> str:
    raw = safe_string(value)
    if not raw:
        return ""
    preferred = re.search(r"\bCRI\s*[-:]?\s*(\d{2,3})\+?\b", raw, flags=re.IGNORECASE)
    if preferred:
        number = int(preferred.group(1))
        return preferred.group(1) if 60 <= number <= 100 else ""
    numbers = re.findall(r"\b\d{2,4}\b", raw)
    for token in numbers:
        try:
            number = int(token)
        except ValueError:
            continue
        if 60 <= number <= 100:
            return str(number)
    return ""


def normalise_table_rows(candidate: Any) -> list[Mapping[str, Any]]:
    if isinstance(candidate, Mapping):
        for key in ("rows", "data", "values", "records", "items", "tableRows"):
            if isinstance(candidate.get(key), list):
                return normalise_table_rows(candidate.get(key))
        return []
    if not isinstance(candidate, list):
        return []
    if candidate and all(isinstance(item, list) for item in candidate):
        headers = [safe_string(item) for item in candidate[0]]
        rows: list[Mapping[str, Any]] = []
        for raw_row in candidate[1:]:
            row: dict[str, Any] = {}
            for index, header in enumerate(headers):
                if header:
                    row[header] = raw_row[index] if index < len(raw_row) else ""
            rows.append(row)
        return rows
    return [row for row in candidate if isinstance(row, Mapping)]


def table_rows(snapshot: Any, table_name: str) -> list[Mapping[str, Any]]:
    if not isinstance(snapshot, dict):
        return []
    candidates = [snapshot]
    for container_key in ("data", "tables", "novondb", "sheets", "snapshot", "activeSnapshot", "authorityReference"):
        container = snapshot.get(container_key)
        if isinstance(container, Mapping):
            candidates.append(container)
    for container in candidates:
        if table_name in container:
            rows = normalise_table_rows(container.get(table_name))
            if rows:
                return rows
        wanted = normalise_field_name(table_name)
        for key, value in container.items():
            if normalise_field_name(key) == wanted:
                rows = normalise_table_rows(value)
                if rows:
                    return rows
    return []


def source_ref(table: str, field: str | None, row_index: int | None = None) -> dict[str, Any]:
    return {
        "table": table,
        "field": field or "",
        "row_ref": f"{table}[{row_index}]" if isinstance(row_index, int) else table,
        "raw_row_returned": False,
        "raw_value_returned": False,
    }


def field_map_entry(field: str, present: bool, classification: str, source: dict[str, Any] | str, reason: str = "") -> dict[str, Any]:
    return {
        "field": field,
        "present": bool(present),
        "classification": classification,
        "source": source,
        "reason": reason,
        "raw_row_returned": False,
        "raw_value_returned": False,
    }


def value_sample_class(value: Any) -> str:
    raw = safe_string(value)
    if not raw:
        return "blank"
    if re.search(r"\bTW[_\s-]*\d{4}[_\s-]*\d{4}\b", raw, flags=re.IGNORECASE):
        return "tunable-white-token"
    if re.search(r"\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?", raw, flags=re.IGNORECASE):
        return "range"
    if re.search(r"[,;/|]|\bor\b", raw, flags=re.IGNORECASE):
        return "token-list"
    if re.search(r"\b(?:22|27|30|35|40|50|57|60|65)00\s*K?\b", raw, flags=re.IGNORECASE):
        return "kelvin-token"
    if re.fullmatch(r"[-+]?\d+(?:\.\d+)?", raw):
        return "numeric"
    if numeric_token(raw):
        return "text-with-numeric-token"
    return "text-token"


def parsed_kind(logical_field: str, value: Any) -> str:
    if logical_field in {"target_lm_per_m", "pitch_mm", "current_ma", "lumen_formula"}:
        return "numeric" if numeric_token(value) else "unparsed"
    if logical_field == "cct":
        parsed = normalise_cct(value)
        if parsed.startswith("TW_"):
            return "tunable-white-token"
        return "kelvin-token" if parsed else "unparsed"
    if logical_field == "cri":
        return "numeric" if normalise_cri(value) else "unparsed"
    return "text" if safe_string(value) else "unparsed"


def parsed_usable(logical_field: str, value: Any) -> bool:
    if logical_field in {"target_lm_per_m", "pitch_mm", "current_ma", "lumen_formula"}:
        return bool(numeric_token(value))
    if logical_field == "cct":
        return bool(normalise_cct(value))
    if logical_field == "cri":
        return bool(normalise_cri(value))
    return bool(safe_string(value))


def value_diagnostic_entry(
    table: str,
    field: str | None,
    row_index: int | None,
    logical_field: str,
    value: Any,
    reason: str = "",
) -> dict[str, Any]:
    nonblank = safe_string(value) != ""
    return {
        "logical_field": logical_field,
        "table": table,
        "field": field or "",
        "row_ref": f"{table}[{row_index}]" if isinstance(row_index, int) else table,
        "blank": not nonblank,
        "nonblank": nonblank,
        "parsed_usable": parsed_usable(logical_field, value),
        "parsed_kind": parsed_kind(logical_field, value),
        "sample_class": value_sample_class(value),
        "reason": reason,
        "raw_row_returned": False,
        "raw_value_returned": False,
    }


def missing_value_diagnostic(logical_field: str, table: str, reason: str) -> dict[str, Any]:
    return {
        "logical_field": logical_field,
        "table": table,
        "field": "",
        "row_ref": table,
        "blank": True,
        "nonblank": False,
        "parsed_usable": False,
        "parsed_kind": "unavailable",
        "sample_class": "missing-field",
        "reason": reason,
        "raw_row_returned": False,
        "raw_value_returned": False,
    }


def candidate_value_diagnostics(board: Mapping[str, Any] | None, board_index: int | None) -> list[dict[str, Any]]:
    if board is None:
        return [
            missing_value_diagnostic("cct", "BOARDS", "No approved BOARDS row with parseable CCT and CRI was found."),
            missing_value_diagnostic("cri", "BOARDS", "No approved BOARDS row with parseable CCT and CRI was found."),
            missing_value_diagnostic(
                "target_lm_per_m",
                "BOARDS",
                "No BOARDS candidate row was available for lm/m inspection.",
            ),
        ]

    diagnostics: list[dict[str, Any]] = []
    for logical_field, group in (
        ("target_lm_per_m", "lm_per_m"),
        ("cct", "cct"),
        ("cri", "cri"),
        ("pitch_mm", "pitch"),
        ("current_ma", "current_ma"),
    ):
        value, field = first_present(board, alias_keys(group))
        if field:
            diagnostics.append(value_diagnostic_entry("BOARDS", field, board_index, logical_field, value))
        else:
            diagnostics.append(
                missing_value_diagnostic(
                    logical_field,
                    "BOARDS",
                    f"No source-backed alias for {logical_field} matched on the candidate BOARDS row.",
                )
            )

    formula_fields: list[str] = []
    for field in alias_keys("lumen_formula"):
        value, actual = first_present(board, (field,))
        if actual:
            formula_fields.append(safe_string(actual))
            diagnostics.append(
                value_diagnostic_entry(
                    "BOARDS",
                    actual,
                    board_index,
                    "lumen_formula",
                    value,
                    "Board-output formula input only; not used to invent selector target_lm_per_m.",
                )
            )
    if formula_fields:
        diagnostics.append(
            missing_value_diagnostic(
                "target_lm_per_m",
                "BOARDS",
                "Board lumen formula inputs are present, but donor contracts treat target_lm_per_m as a selector target/delivered lm/m input. The runner does not convert board maximum output into a target value.",
            )
        )
    return diagnostics


def table_alias_summary(snapshot: Mapping[str, Any], table: str) -> dict[str, Any]:
    rows = table_rows(snapshot, table)
    groups: dict[str, Any] = {}
    for group in SCHEMA_INTROSPECTION_GROUPS:
        aliases = alias_keys(group)
        matched_fields: list[str] = []
        matched_refs: list[str] = []
        for index, row in enumerate(rows):
            _value, field = first_present(row, aliases)
            if not field:
                continue
            field_text = safe_string(field)
            if field_text not in matched_fields:
                matched_fields.append(field_text)
            row_ref = f"{table}[{index}]"
            if row_ref not in matched_refs:
                matched_refs.append(row_ref)
            if len(matched_refs) >= 5:
                break
        groups[group] = {
            "candidate_aliases": list(aliases),
            "matched": bool(matched_fields),
            "matched_field_names": matched_fields[:5],
            "matched_row_refs": matched_refs[:5],
            "raw_rows_returned": False,
            "raw_headers_returned": False,
        }
    return {
        "table": table,
        "row_count": len(rows),
        "alias_groups": groups,
        "raw_rows_returned": False,
        "raw_headers_returned": False,
    }


def safe_schema_introspection(snapshot: Mapping[str, Any]) -> list[dict[str, Any]]:
    return [table_alias_summary(snapshot, table) for table in SCHEMA_INTROSPECTION_TABLES]


def load_mcp_module() -> Any:
    spec = importlib.util.spec_from_file_location("controlstack_mcp_host_readonly", MCP_SOURCE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to create import spec for local controlstack_mcp.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def safe_source_summary(source_meta: Mapping[str, Any]) -> dict[str, Any]:
    source = source_meta.get("source") if isinstance(source_meta.get("source"), Mapping) else {}
    return {
        "ok": bool(source_meta.get("ok")),
        "source_label": source.get("label") or source_meta.get("source_path_label") or "runtime-authority-reference-active-snapshot",
        "active_source_db_loaded_read_only": bool(source_meta.get("active_source_db_loaded_read_only") or source_meta.get("loaded_read_only")),
        "source_fingerprint_available": bool(source_meta.get("source_fingerprint_available") or source.get("source_fingerprint")),
        "present_tables": list(source_meta.get("present_tables") or []),
        "missing_tables": list(source_meta.get("missing_tables") or []),
        "table_summary": list(source_meta.get("table_summary") or []),
        "users_redaction_status": dict(source_meta.get("users_redaction_status") or {}),
        "source_path_returned": False,
        "raw_rows_exposed": False,
        "raw_headers_exposed": False,
        "raw_users_exposed": False,
        "raw_snapshot_returned": False,
        "raw_snapshot_serialized": False,
    }


def find_tier(snapshot: Mapping[str, Any]) -> tuple[str, dict[str, Any] | None, list[dict[str, Any]]]:
    rows = table_rows(snapshot, "SYSTEM_POLICY")
    blockers: list[dict[str, Any]] = []
    required_policy_items = {"led_current_headroom_max_pct", "led_headroom_watts_multi"}
    candidate_tiers: dict[str, set[str]] = {}
    for index, row in enumerate(rows):
        item = safe_string(row.get("item"))
        if not item:
            continue
        for key, value in row.items():
            if safe_string(key).lower() in {"item", "notes", "description", "source", "owner"}:
                continue
            if value in (None, "", [], {}):
                continue
            candidate_tiers.setdefault(safe_string(key), set()).add(item)
    preferred = ["Business", "Economy", "First", "Charter", "business", "economy", "first", "charter"]
    ordered = preferred + sorted([key for key in candidate_tiers.keys() if key not in preferred])
    for tier in ordered:
        if required_policy_items.issubset(candidate_tiers.get(tier, set())):
            return tier, source_ref("SYSTEM_POLICY", "tier-column", None), blockers
    if candidate_tiers:
        tier = ordered[0]
        blockers.append(safe_blocker("candidate-tier-policy-incomplete", "A source-backed tier column exists, but required Engine tier policies were not all present for that tier."))
        return tier, source_ref("SYSTEM_POLICY", "tier-column", None), blockers
    return "", None, [safe_blocker("candidate-tier-unavailable", "No source-backed tier column could be derived from SYSTEM_POLICY.")]


def find_lighting_board(snapshot: Mapping[str, Any]) -> tuple[Mapping[str, Any] | None, int | None]:
    for index, row in enumerate(table_rows(snapshot, "BOARDS")):
        approval_value, approval_key = first_present(row, alias_keys("approval"))
        if approval_key and explicitly_false(approval_value):
            continue
        cct, _ = first_present(row, alias_keys("cct"))
        cri, _ = first_present(row, alias_keys("cri"))
        if normalise_cct(cct) and normalise_cri(cri):
            return row, index
    return None, None


def find_board(snapshot: Mapping[str, Any]) -> tuple[Mapping[str, Any] | None, int | None]:
    return find_lighting_board(snapshot)


def find_optic(snapshot: Mapping[str, Any], system_hint: str = "", board: Mapping[str, Any] | None = None, board_index: int | None = None) -> tuple[str, dict[str, Any] | None]:
    if board is not None:
        value, key = first_present(board, alias_keys("optic"))
        if safe_string(value):
            return split_first(value), source_ref("BOARDS", key, board_index)
    rows = table_rows(snapshot, "OPTICS")
    for index, row in enumerate(rows):
        if system_hint:
            system_value, _ = first_present(row, alias_keys("system"))
            if system_value and safe_string(system_hint).lower() not in safe_string(system_value).lower() and safe_string(system_value).lower() not in safe_string(system_hint).lower():
                continue
        value, key = first_present(row, alias_keys("optic"))
        if safe_string(value):
            return split_first(value), source_ref("OPTICS", key, index)
    for index, row in enumerate(rows):
        value, key = first_present(row, alias_keys("optic"))
        if safe_string(value):
            return split_first(value), source_ref("OPTICS", key, index)
    return "", None


def find_control_type(snapshot: Mapping[str, Any], board: Mapping[str, Any] | None) -> tuple[str, dict[str, Any] | None]:
    if board is not None:
        value, key = first_present(board, alias_keys("control_type"))
        if safe_string(value):
            return split_first(value), source_ref("BOARDS", key, None)
    for index, row in enumerate(table_rows(snapshot, "DRIVERS")):
        value, key = first_present(row, alias_keys("control_type"))
        if safe_string(value):
            return split_first(value), source_ref("DRIVERS", key, index)
    return "", None


def find_system(snapshot: Mapping[str, Any], board: Mapping[str, Any] | None) -> tuple[str, dict[str, Any] | None]:
    if board is not None:
        value, key = first_present(board, alias_keys("system"))
        if safe_string(value):
            return split_first(value), source_ref("BOARDS", key, None)
    for index, row in enumerate(table_rows(snapshot, "SYSTEM")):
        value, key = first_present(row, alias_keys("system"))
        if safe_string(value):
            return split_first(value), source_ref("SYSTEM", key, index)
    return "", None


def derive_candidate_from_snapshot(snapshot: Mapping[str, Any]) -> dict[str, Any]:
    blockers: list[dict[str, Any]] = []
    field_source_map: list[dict[str, Any]] = []

    tier, tier_source, tier_blockers = find_tier(snapshot)
    blockers.extend(tier_blockers)
    board, board_index = find_lighting_board(snapshot)
    value_diagnostics = candidate_value_diagnostics(board, board_index)
    system, system_source = find_system(snapshot, board)
    optic, optic_source = find_optic(snapshot, system_hint=system, board=board, board_index=board_index)
    control_type, control_source = find_control_type(snapshot, board)

    lighting: dict[str, Any] = {}
    electrical: dict[str, Any] = {}

    target_lm_per_m = ""
    cct = ""
    cri = ""
    pitch = ""
    current_ma = ""
    light_direction = ""
    light_direction_source = None
    board_source = None
    if board is not None:
        board_source = source_ref("BOARDS", "candidate-row", board_index)
        lm_value, lm_key = first_present(board, alias_keys("lm_per_m"))
        cct_value, cct_key = first_present(board, alias_keys("cct"))
        cri_value, cri_key = first_present(board, alias_keys("cri"))
        pitch_value, pitch_key = first_present(board, alias_keys("pitch"))
        current_value, current_key = first_present(board, alias_keys("current_ma"))
        direction_value, direction_key = first_present(board, alias_keys("direction"))
        direction_text = safe_string(direction_value).lower()
        if "indirect" in direction_text or "uplight" in direction_text or re.search(r"\bup\b", direction_text):
            light_direction = "Indirect"
            light_direction_source = source_ref("BOARDS", direction_key, board_index)
        elif "direct" in direction_text or "downlight" in direction_text or re.search(r"\bdown\b", direction_text):
            light_direction = "Direct"
            light_direction_source = source_ref("BOARDS", direction_key, board_index)
        target_lm_per_m = numeric_token(lm_value)
        cct = normalise_cct(cct_value)
        cri = normalise_cri(cri_value)
        pitch = numeric_token(pitch_value)
        current_ma = numeric_token(current_value)
        lm_source = source_ref("BOARDS", lm_key, board_index) if lm_key and target_lm_per_m else None
        cct_source = source_ref("BOARDS", cct_key, board_index) if cct_key and cct else None
        cri_source = source_ref("BOARDS", cri_key, board_index) if cri_key and cri else None
        pitch_source = source_ref("BOARDS", pitch_key, board_index) if pitch_key and pitch else None
        current_source = source_ref("BOARDS", current_key, board_index) if current_key and current_ma else None
    else:
        blockers.append(safe_blocker("candidate-board-unavailable", "No approved source-backed BOARDS row with parseable CCT and CRI could be derived."))
        lm_source = cct_source = cri_source = pitch_source = current_source = None

    if target_lm_per_m:
        lighting["target_lm_per_m"] = target_lm_per_m
        lighting["lm_per_m"] = target_lm_per_m
    if cct:
        lighting["cct"] = cct
    if cri:
        lighting["cri"] = cri
    if pitch:
        lighting["pitch_mm"] = pitch
    if optic:
        lighting["optic_key"] = optic
    if light_direction:
        lighting["light_direction"] = light_direction
    if control_type:
        lighting["control_type"] = control_type
        electrical["require_dali"] = "dali" in control_type.lower()
    if current_ma:
        electrical["current_ma"] = int(float(current_ma))

    selector_payload: dict[str, Any] = {
        "tier": tier,
        "runs": [dict(CONTROLLED_RUN)],
        "lighting": lighting,
        "optic": {"key": optic} if optic else {},
        "control_type": control_type,
        "electrical": electrical,
        "host_local_readonly_evidence": True,
    }
    if system:
        selector_payload["system"] = system

    field_source_map.extend([
        field_map_entry("db", True, "internal-active-source", "engine seam injects active RuntimeData snapshot in memory only", "Caller-supplied db is refused and not serialized."),
        field_map_entry("tier", bool(tier), "source-backed-required", tier_source or "unavailable"),
        field_map_entry("runs", True, "controlled-test-geometry", "host-local runner controlled run length/quantity", "Controlled geometry only; not product data."),
        field_map_entry("lighting", bool(lighting), "source-backed-required", board_source or "unavailable"),
        field_map_entry("target_lm_per_m", bool(target_lm_per_m), "source-backed-required", lm_source or "unavailable"),
        field_map_entry("cct", bool(cct), "source-backed-required", cct_source or "unavailable"),
        field_map_entry("cri", bool(cri), "source-backed-required", cri_source or "unavailable"),
        field_map_entry("optic", bool(optic), "source-backed-required", optic_source or "unavailable"),
        field_map_entry("control_type", bool(control_type), "source-backed-required", control_source or "unavailable"),
        field_map_entry("current_ma", bool(current_ma), "optional-source-backed", current_source or "unavailable", "Optional; donor Engine may derive current only where source data supports it."),
        field_map_entry("pitch_mm", bool(pitch), "source-backed-engine-helper", pitch_source or "unavailable", "Not part of the seam completeness gate but used by donor board selection when present."),
        field_map_entry("light_direction", bool(light_direction), "optional-source-backed-engine-helper", light_direction_source or "unavailable", "Optional; no default direction is invented by the runner."),
        field_map_entry("system", bool(system), "source-backed-context", system_source or "unavailable"),
    ])

    for required_field in REQUIRED_CANDIDATE_FIELDS:
        if required_field == "runs":
            present = bool(selector_payload.get("runs"))
        elif required_field == "lighting":
            present = bool(selector_payload.get("lighting"))
        elif required_field in {"target_lm_per_m", "cct", "cri"}:
            present = required_field in lighting and lighting.get(required_field) not in (None, "")
        elif required_field == "optic":
            present = bool(optic)
        elif required_field == "control_type":
            present = bool(control_type)
        else:
            present = selector_payload.get(required_field) not in (None, "", [], {})
        if not present:
            blockers.append(safe_blocker(f"missing-candidate-field-{required_field}", f"Required Engine candidate field is missing or unavailable from source: {required_field}."))

    complete = not [b for b in blockers if b.get("severity") == "blocking"]
    return {
        "complete": complete,
        "candidate_payload_available_in_memory": complete,
        "candidate_payload_serialized": False,
        "candidate_payload_returned": False,
        "candidate_private_values_redacted_in_report": True,
        "candidate_source_used": "runtime-authority-reference-active-snapshot plus controlled run geometry; BOARDS row selected for source-backed CCT/CRI" if board is not None else "runtime-authority-reference-active-snapshot attempted; no complete BOARDS CCT/CRI candidate",
        "field_source_map": field_source_map,
        "value_diagnostics": value_diagnostics,
        "schema_introspection": safe_schema_introspection(snapshot),
        "blockers": blockers,
        "selector_payload": selector_payload if complete else None,
    }


def run_preflight(module: Any) -> dict[str, Any]:
    seam_result = module.engine_runtable_internal_readonly_invoke_probe(selector_payload={}, execute=False)
    return {
        "mode": "preflight",
        "ok": bool(seam_result.get("active_source_db_loaded_read_only")),
        "internal_seam_called_directly": True,
        "active_source_db_loaded_internally": bool(seam_result.get("active_source_db_loaded_read_only")),
        "engine_execution_attempted": False,
        "donor_bridge_used": bool(seam_result.get("donor_bridge_used")),
        "source_summary": seam_result.get("source_summary"),
        "candidate_blockers_reported": [item for item in seam_result.get("blockers", []) if safe_string(item.get("code")).startswith("missing-candidate-field")],
        "execute_flag_blocker_present": any(item.get("code") == "execute-flag-not-set" for item in seam_result.get("blockers", [])),
    }


def run_derive_candidate(module: Any) -> dict[str, Any]:
    snapshot, source_meta = module._load_runtime_data_active_source_internal()
    source_summary = safe_source_summary(source_meta if isinstance(source_meta, Mapping) else {})
    if snapshot is None or not isinstance(snapshot, Mapping):
        return {
            "mode": "derive-candidate",
            "ok": False,
            "active_source_db_loaded_internally": False,
            "source_summary": source_summary,
            "candidate_derivation_attempted": True,
            "candidate": {
                "complete": False,
                "candidate_payload_serialized": False,
                "field_source_map": [],
                "blockers": [safe_blocker("active-source-snapshot-unavailable", "Active source snapshot was unavailable for candidate derivation.")],
            },
        }
    candidate = derive_candidate_from_snapshot(snapshot)
    redacted_candidate = {key: value for key, value in candidate.items() if key != "selector_payload"}
    return {
        "mode": "derive-candidate",
        "ok": bool(candidate.get("complete")),
        "active_source_db_loaded_internally": True,
        "source_summary": source_summary,
        "candidate_derivation_attempted": True,
        "candidate": redacted_candidate,
    }


def run_execute(module: Any) -> dict[str, Any]:
    derivation = run_derive_candidate(module)
    snapshot, _source_meta = module._load_runtime_data_active_source_internal()
    if snapshot is None or not isinstance(snapshot, Mapping):
        return {
            "mode": "execute",
            "ok": False,
            "candidate_derivation": derivation,
            "engine_execution_attempted": False,
            "engine_result_produced": False,
            "blockers": [safe_blocker("active-source-snapshot-unavailable", "Active source snapshot was unavailable for execute precondition.")],
        }
    candidate = derive_candidate_from_snapshot(snapshot)
    selector_payload = candidate.get("selector_payload")
    if not candidate.get("complete") or not isinstance(selector_payload, dict):
        return {
            "mode": "execute",
            "ok": False,
            "candidate_derivation": {key: value for key, value in candidate.items() if key != "selector_payload"},
            "engine_execution_attempted": False,
            "engine_result_produced": False,
            "blockers": candidate.get("blockers", []),
        }

    seam_result = module.engine_runtable_internal_readonly_invoke_probe(selector_payload=selector_payload, execute=True)
    return {
        "mode": "execute",
        "ok": bool(seam_result.get("engine_result_produced")),
        "candidate_derivation": {key: value for key, value in candidate.items() if key != "selector_payload"},
        "engine_execution_attempted": bool(seam_result.get("engine_execution_attempted")),
        "engine_result_produced": bool(seam_result.get("engine_result_produced")),
        "safe_engine_summary": seam_result.get("safe_engine_summary"),
        "adapter_projection_ies_handoff": {
            "attempted": False,
            "available": False,
            "blocker": "No persisted or accepted selected-result contract object is created by this host-local evidence runner; adapter/projection/IES handoff remains blocked unless a future safe selected-result source object is added.",
        },
        "blockers": seam_result.get("blockers", []),
        "warnings": seam_result.get("warnings", []),
    }


def base_report(mode: str) -> dict[str, Any]:
    return {
        "stage": STAGE_NAME,
        "generated_at": utc_now(),
        "mode": mode,
        "runner": "tools/evidence/engine_runtable_host_readonly_real_run.py",
        "host_local_runner_added": True,
        "internal_seam_source": "tools/controlstack-mcp/controlstack_mcp.py::engine_runtable_internal_readonly_invoke_probe",
        "source_access_path": "tools/controlstack-mcp/controlstack_mcp.py::_load_runtime_data_active_source_internal",
        "donor_bridge_used": False,
        "donor_bridge_audit_jsonl_write_enabled": False,
        "audit_jsonl_write_attempted": False,
        "product_data_invented": False,
        **RAW_EXPOSURE_CHECKS,
        **ROUTE_POST_CHECKS,
    }


def write_report(report: Mapping[str, Any]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    text = json.dumps(report, indent=2, sort_keys=True)
    STAGE_REPORT_PATH.write_text(text + "\n", encoding="utf-8")
    LATEST_REPORT_PATH.write_text(text + "\n", encoding="utf-8")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Host-local read-only Engine / RunTable evidence runner")
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--preflight", action="store_true", help="Load active source internally and report redacted preflight only")
    modes.add_argument("--derive-candidate", action="store_true", help="Derive one source-backed candidate without Engine execution")
    modes.add_argument("--execute", action="store_true", help="Execute only after a complete source-backed candidate is derived")
    parser.add_argument("--no-write-report", action="store_true", help="Print redacted report without writing _worker_reports copies")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args_list = list(sys.argv[1:] if argv is None else argv)
    refuse_caller_supplied_db(args_list)
    args = parse_args(args_list)
    mode = "preflight"
    if args.derive_candidate:
        mode = "derive-candidate"
    elif args.execute:
        mode = "execute"

    report = base_report(mode)
    try:
        module = load_mcp_module()
        if args.execute:
            mode_result = run_execute(module)
        elif args.derive_candidate:
            mode_result = run_derive_candidate(module)
        else:
            mode_result = run_preflight(module)
        report.update(mode_result)
    except Exception as exc:  # noqa: BLE001 - redacted diagnostic only
        report.update(
            {
                "ok": False,
                "blockers": [safe_blocker("host-local-runner-exception", f"Runner failed with {exc.__class__.__name__}; message redacted.")],
                "exception_message_redacted": True,
            }
        )

    if not args.no_write_report:
        write_report(report)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if bool(report.get("ok")) else 2


if __name__ == "__main__":
    raise SystemExit(main())
