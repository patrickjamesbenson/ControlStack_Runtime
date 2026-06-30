from __future__ import annotations

r"""Runtime-owned ControlStack MCP server.

This MCP exposes a deliberately small, guarded tool surface for the local
ControlStack runtime repo and optional donor-reference repo. It does not expose
arbitrary terminal execution, caller-supplied shell commands, force-push, or
unbounded filesystem access.
"""

import difflib
import fnmatch
import hashlib
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

from mcp.server.fastmcp import FastMCP

DEFAULT_RUNTIME_ROOT = r"C:\ControlStack_Runtime"
DEFAULT_DONOR_REFERENCE_ROOT = r"C:\ControlStack"
DEFAULT_RUNTIMEDATA_ROOT = r"C:\ControlStack_RuntimeData"
DEFAULT_MAX_CHARS = 50_000
DEFAULT_MAX_DIR_ENTRIES = 200
DEFAULT_HTTP_PATH = "/mcp"
MAX_TEXT_BYTES = 5 * 1024 * 1024
MAX_RUNTIMEDATA_SOURCE_BYTES = 25 * 1024 * 1024

ACTIVE_TRANSPORT = os.environ.get("CONTROLSTACK_MCP_TRANSPORT", "stdio").strip().lower()
RUNTIME_ROOT = Path(os.environ.get("CONTROLSTACK_RUNTIME_ROOT", DEFAULT_RUNTIME_ROOT)).resolve()
DONOR_REFERENCE_ROOT = Path(os.environ.get("CONTROLSTACK_DONOR_REFERENCE_ROOT", DEFAULT_DONOR_REFERENCE_ROOT)).resolve()
RUNTIMEDATA_ROOT = Path(os.environ.get("CONTROLSTACK_RUNTIMEDATA_ROOT", DEFAULT_RUNTIMEDATA_ROOT)).resolve()
RUNTIMEDATA_AUTHORITY_REFERENCE_ROOT = RUNTIMEDATA_ROOT / "authority-reference"
RUNTIMEDATA_ACTIVE_SOURCE_PATH = RUNTIMEDATA_AUTHORITY_REFERENCE_ROOT / "novondb.json"
WEBHOOK_BASE_URL = os.environ.get("CONTROLSTACK_WEBHOOK_BASE_URL", "http://127.0.0.1:8787").rstrip("/")

HTTP_HOST = os.environ.get("CONTROLSTACK_MCP_HOST", "127.0.0.1")
HTTP_PORT = int(os.environ.get("CONTROLSTACK_MCP_PORT", "8000"))
HTTP_PATH = os.environ.get("CONTROLSTACK_MCP_PATH", DEFAULT_HTTP_PATH)

logging.basicConfig(level=logging.INFO, stream=sys.stderr, format="[%(asctime)s] %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("runtime_controlstack_mcp")

mcp = FastMCP(
    "ControlStack Runtime",
    instructions=(
        "Use these tools for the configured local ControlStack roots only: repo and runtime. "
        "Never request or write paths outside the selected root. Donor-reference roots are read-only. "
        "A dedicated RuntimeData probe may read only the approved active source DB and returns redacted metadata/counts only. "
        "Do not use arbitrary terminal execution."
    ),
    stateless_http=True,
    json_response=True,
    host=HTTP_HOST,
    port=HTTP_PORT,
    streamable_http_path=HTTP_PATH,
)

EXCLUDED_DIRS = {".git", ".venv", "node_modules", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache", "dist", "build"}
EXCLUDED_GLOBS = {"*.pyc", "*.pyo", "*.bak", "*.bak_*", "*.log"}
GIT_INDEX_JUNK_DIRS = {"node_modules", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"}
GIT_INDEX_ARCHIVE_EXTS = {".zip", ".tar", ".tgz", ".rar", ".7z", ".gz", ".bz2", ".xz"}
GIT_INDEX_GLOB_CHARS = {"*", "?", "[", "]"}
ALLOWED_GATES = {"selector", "test", "runtime"}
FIXED_GATE_COMMAND = ["npm.cmd", "test"]
RUNTIMEDATA_SELECTOR_CRITICAL_TABLES = [
    "SYSTEM",
    "OPTICS",
    "ACCESSORIES",
    "SPEC_CODES",
    "BOARDS",
    "DRIVERS",
    "PURE_REF_STATE",
    "SYSTEM_COMPONENTS",
    "SYSTEM_BOM_DEFAULTS",
    "SYSTEM_POLICY",
    "FIELD_EDITABILITY",
    "ROLES_AND_LANES",
    "CODE_POLICY",
    "MESSAGES",
    "USERS",
]

LAST_RUNTIME_GATE_RESULT: dict[str, Any] | None = None


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


ENABLE_WRITE = _env_bool("CONTROLSTACK_ENABLE_WRITE", default=ACTIVE_TRANSPORT == "stdio")


def _root_label(root: str = "runtime") -> str:
    label = (root or "runtime").strip().lower()
    if label in {"runtime", "repo"}:
        return "runtime"
    if label in {"donor", "donor_reference", "reference"}:
        return "donor"
    raise ValueError("root must be 'runtime'/'repo' or read-only 'donor'")


def _root_path(root: str = "runtime") -> Path:
    return RUNTIME_ROOT if _root_label(root) == "runtime" else DONOR_REFERENCE_ROOT


def _require_root_exists(root: str = "runtime") -> None:
    label = _root_label(root)
    base = _root_path(label)
    if not base.exists():
        if label == "donor":
            raise FileNotFoundError(f"Optional donor_reference_root is absent: {base}")
        raise FileNotFoundError(f"Configured runtime root does not exist: {base}")
    if not base.is_dir():
        raise NotADirectoryError(f"Configured root is not a directory: {base}")


def _require_runtime(root: str = "runtime") -> None:
    if _root_label(root) != "runtime":
        raise PermissionError("This tool is runtime-only. Donor reference is read-only.")
    _require_root_exists("runtime")


def _require_write_enabled() -> None:
    if not ENABLE_WRITE:
        raise PermissionError("Write tools are disabled. Set CONTROLSTACK_ENABLE_WRITE=1 to enable them.")


def _path_has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 or ord(ch) == 127 for ch in value)


def _path_has_glob_chars(value: str) -> bool:
    return any(ch in value for ch in GIT_INDEX_GLOB_CHARS)


def _path_has_parent_traversal(value: str) -> bool:
    return any(part == ".." for part in re.split(r"[\\/]+", value))


def _reject_bad_path_string(value: str, *, allow_glob: bool = False) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError("path is required and must be a non-empty string")
    if _path_has_control_chars(value):
        raise ValueError("NUL, newline, or control characters are not allowed in paths")
    if not allow_glob and _path_has_glob_chars(value):
        raise ValueError("wildcards/globs are not allowed; provide an explicit path")
    if _path_has_parent_traversal(value):
        raise ValueError("path traversal segments such as ../ are not allowed")


def _resolve_path(root: str = "runtime", relative_path: str = ".") -> Path:
    label = _root_label(root)
    _require_root_exists(label)
    raw = relative_path or "."
    raw_path = Path(raw)
    candidate = raw_path.resolve() if raw_path.is_absolute() else (_root_path(label) / raw).resolve()
    try:
        candidate.relative_to(_root_path(label))
    except ValueError as exc:
        raise ValueError(f"Path escapes selected root {label!r}: {relative_path!r}") from exc
    return candidate


def _lexically_confined_runtime_path(path_value: str) -> Path:
    _reject_bad_path_string(path_value)
    raw_path = Path(path_value)
    candidate = raw_path if raw_path.is_absolute() else RUNTIME_ROOT / path_value
    candidate = Path(os.path.abspath(candidate))
    try:
        candidate.relative_to(RUNTIME_ROOT)
    except ValueError as exc:
        raise ValueError(f"Path escapes runtime root: {path_value!r}") from exc
    return candidate


def _rel(root: str, path: Path) -> str:
    return str(path.resolve().relative_to(_root_path(root))).replace("\\", "/")


def _clip_text(text: str, max_chars: int = DEFAULT_MAX_CHARS) -> tuple[str, bool]:
    if max_chars <= 0 or len(text) <= max_chars:
        return text, False
    return text[:max_chars], True


def _read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def _try_parse_json(text: str) -> Any | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _is_binary(path: Path) -> bool:
    try:
        with path.open("rb") as handle:
            return b"\0" in handle.read(8192)
    except OSError:
        return True


def _excluded(root: str, path: Path, extra: list[str] | None = None) -> bool:
    try:
        rel = _rel(root, path)
    except ValueError:
        return True
    parts = set(Path(rel).parts)
    if parts & EXCLUDED_DIRS:
        return True
    for glob in EXCLUDED_GLOBS | set(extra or []):
        if fnmatch.fnmatch(path.name, glob) or fnmatch.fnmatch(rel, glob):
            return True
    return False


def _iter_files(root: str, relative_path: str = ".", include_globs: list[str] | None = None, exclude_globs: list[str] | None = None, max_files: int = 50_000):
    label = _root_label(root)
    base = _resolve_path(label, relative_path)
    if base.is_file():
        candidates = [base]
    elif base.is_dir():
        candidates = []
        for current, dirs, files in os.walk(base):
            current_path = Path(current)
            dirs[:] = sorted(d for d in dirs if not _excluded(label, current_path / d, exclude_globs))
            for filename in sorted(files):
                candidates.append(current_path / filename)
                if len(candidates) >= max_files:
                    break
            if len(candidates) >= max_files:
                break
    else:
        return
    yielded = 0
    for path in candidates:
        if yielded >= max_files:
            break
        if not path.is_file() or _excluded(label, path, exclude_globs):
            continue
        rel = _rel(label, path)
        if include_globs and not any(fnmatch.fnmatch(path.name, glob) or fnmatch.fnmatch(rel, glob) for glob in include_globs):
            continue
        yielded += 1
        yield path


def _safe_env_for_child() -> dict[str, str]:
    allowed_keys = {
        "APPDATA", "COMSPEC", "HOME", "LOCALAPPDATA", "PATH", "PATHEXT", "PROGRAMFILES",
        "PROGRAMFILES(X86)", "PROGRAMW6432", "SYSTEMDRIVE", "SYSTEMROOT", "TEMP", "TMP", "USERPROFILE", "WINDIR",
    }
    env = {key: value for key, value in os.environ.items() if key.upper() in allowed_keys}
    env["CI"] = "1"
    env["NO_COLOR"] = "1"
    env["NPM_CONFIG_COLOR"] = "false"
    env["NPM_CONFIG_UPDATE_NOTIFIER"] = "false"
    return env


def _run_git(args: list[str], timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS, input_text: str | None = None) -> dict[str, Any]:
    _require_runtime("runtime")
    started = time.monotonic()
    cmd = ["git", *args]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(RUNTIME_ROOT),
            env=_safe_env_for_child(),
            input=input_text,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_s,
            shell=False,
        )
    except FileNotFoundError:
        return {"ok": False, "root": "runtime", "root_path": str(RUNTIME_ROOT), "error": "git_not_found", "command": cmd}
    except subprocess.TimeoutExpired:
        return {"ok": False, "root": "runtime", "root_path": str(RUNTIME_ROOT), "error": "timeout", "command": cmd}
    stdout, stdout_truncated = _clip_text(proc.stdout or "", max_chars)
    stderr, stderr_truncated = _clip_text(proc.stderr or "", max_chars)
    return {
        "ok": proc.returncode == 0,
        "root": "runtime",
        "root_path": str(RUNTIME_ROOT),
        "returncode": proc.returncode,
        "duration_s": round(time.monotonic() - started, 3),
        "command": cmd,
        "stdout": stdout,
        "stderr": stderr,
        "truncated": stdout_truncated or stderr_truncated,
    }


def _git_index_junk_reason(relative_path: str) -> str | None:
    relp = relative_path.replace("\\", "/")
    name = relp.rsplit("/", 1)[-1]
    parts = set(relp.split("/"))
    for junk_dir in sorted(GIT_INDEX_JUNK_DIRS):
        if junk_dir in parts:
            return f"junk/cache directory rejected by default: {junk_dir}"
    if relp.startswith("dist/assets/") or "/dist/assets/" in relp:
        return "dist/assets output requires allow_junk=true after explicit review"
    if name.endswith(".bak") or ".bak_safe_patch_" in name or ".BACKUP_" in name:
        return "backup artifact rejected by default"
    lower = name.lower()
    for ext in sorted(GIT_INDEX_ARCHIVE_EXTS, key=len, reverse=True):
        if lower.endswith(ext):
            return f"archive output rejected by default: *{ext}"
    return None


def _prepare_git_index_paths(paths: list[str], *, require_existing_files: bool, allow_missing: bool, allow_junk: bool) -> tuple[list[str], list[dict[str, Any]]]:
    if not isinstance(paths, list) or not paths:
        raise ValueError("paths[] is required and must contain at least one explicit path")
    accepted: list[str] = []
    rejected: list[dict[str, Any]] = []
    for raw in paths:
        requested = str(raw)
        reason = None
        resolved: Path | None = None
        try:
            resolved = _lexically_confined_runtime_path(requested)
        except Exception as exc:
            reason = str(exc)
        if reason is None and resolved is not None:
            exists = resolved.exists()
            if exists and resolved.is_dir():
                reason = "directory paths are rejected; provide explicit file paths"
            elif require_existing_files and not (exists and resolved.is_file()):
                reason = "file does not exist or is not a regular file"
            elif not allow_missing and not exists:
                reason = "path does not exist"
        if reason is None and resolved is not None:
            relp = str(resolved.relative_to(RUNTIME_ROOT)).replace("\\", "/")
            if not allow_junk:
                reason = _git_index_junk_reason(relp)
            if reason is None and relp not in accepted:
                accepted.append(relp)
        if reason is not None:
            rejected.append({"path": requested, "reason": reason})
    return accepted, rejected


def _git_status_details() -> dict[str, Any]:
    raw = _run_git(["status", "--porcelain=v1", "-b"], max_chars=200_000)
    branch = _run_git(["rev-parse", "--abbrev-ref", "HEAD"])
    modified: list[str] = []
    staged: list[str] = []
    untracked: list[str] = []
    deleted: list[str] = []
    ahead_behind = ""
    if raw.get("ok"):
        for line in str(raw.get("stdout") or "").splitlines():
            if line.startswith("## "):
                ahead_behind = line[3:]
                continue
            if len(line) < 4:
                continue
            xy, path = line[:2], line[3:].replace("\\", "/")
            if " -> " in path:
                path = path.split(" -> ", 1)[1]
            if xy == "??":
                untracked.append(path)
            else:
                if xy[0] != " ":
                    staged.append(path)
                if "D" in xy:
                    deleted.append(path)
                if xy[1] != " ":
                    modified.append(path)
    return {
        "ok": bool(raw.get("ok")),
        "root": "runtime",
        "root_path": str(RUNTIME_ROOT),
        "branch": str(branch.get("stdout") or "").strip(),
        "modified": modified,
        "staged": staged,
        "untracked": untracked,
        "deleted": deleted,
        "ahead_behind": ahead_behind,
        "raw": raw,
    }


def _normalise_paths(paths: list[str]) -> list[str]:
    normalised: list[str] = []
    for item in paths:
        candidate = _lexically_confined_runtime_path(str(item))
        relp = str(candidate.relative_to(RUNTIME_ROOT)).replace("\\", "/")
        if relp not in normalised:
            normalised.append(relp)
    return normalised


def _gate_green() -> bool:
    return bool(LAST_RUNTIME_GATE_RESULT and LAST_RUNTIME_GATE_RESULT.get("ok") is True and LAST_RUNTIME_GATE_RESULT.get("returncode") == 0)


def _copy_file_between(from_root: str, from_path: str, to_root: str, to_path: str, *, overwrite: bool, dry_run: bool, make_parents: bool) -> dict[str, Any]:
    source_label = _root_label(from_root)
    target_label = _root_label(to_root)
    if target_label != "runtime":
        raise PermissionError("Copy destinations must be inside the runtime root. Donor reference is read-only.")
    _reject_bad_path_string(from_path)
    _reject_bad_path_string(to_path)
    source = _resolve_path(source_label, from_path)
    target = _resolve_path(target_label, to_path)
    if not source.exists() or not source.is_file():
        raise FileNotFoundError(f"Source file does not exist or is not a file: {from_path}")
    if target.exists() and target.is_dir():
        raise IsADirectoryError(f"Destination is a directory: {to_path}")
    if target.exists() and not overwrite:
        raise FileExistsError(f"Destination exists and overwrite=False: {to_path}")
    payload = {
        "ok": True,
        "from_root": source_label,
        "to_root": target_label,
        "from_path": _rel(source_label, source),
        "to_path": _rel(target_label, target),
        "dry_run": dry_run,
        "overwrite": overwrite,
        "changed": False,
        "bytes": source.stat().st_size,
    }
    if dry_run:
        return payload
    _require_write_enabled()
    if make_parents:
        target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    payload["changed"] = True
    return payload


def _extract_diff_paths(diff_text: str) -> list[str]:
    paths: list[str] = []
    for line in diff_text.splitlines():
        candidate: str | None = None
        if line.startswith("+++ ") or line.startswith("--- "):
            raw = line[4:].split("\t", 1)[0].strip()
            if raw == "/dev/null":
                continue
            candidate = raw[2:] if raw.startswith(("a/", "b/")) else raw
        elif line.startswith("rename from "):
            candidate = line[len("rename from ") :].strip()
        elif line.startswith("rename to "):
            candidate = line[len("rename to ") :].strip()
        if candidate:
            _reject_bad_path_string(candidate)
            resolved = _lexically_confined_runtime_path(candidate)
            relp = str(resolved.relative_to(RUNTIME_ROOT)).replace("\\", "/")
            if relp not in paths:
                paths.append(relp)
    return paths


def _replace_nth(text: str, target: str, replacement: str, occurrence: int) -> tuple[str, int]:
    if target == "":
        raise ValueError("target is required for replace_text, insert_before, and insert_after")
    if occurrence == 0:
        count = text.count(target)
        if count == 0:
            return text, 0
        return text.replace(target, replacement), count
    if occurrence < 1:
        raise ValueError("occurrence must be >= 1, or 0 to replace all occurrences")
    start = -1
    search_from = 0
    for _ in range(occurrence):
        start = text.find(target, search_from)
        if start == -1:
            return text, 0
        search_from = start + len(target)
    return text[:start] + replacement + text[start + len(target) :], 1


def _runtime_data_blocker(code: str, reason: str, severity: str = "blocking") -> dict[str, Any]:
    return {"code": code, "severity": severity, "reason": reason}


def _runtime_data_rows(snapshot: Any, table_name: str) -> list[Any]:
    if isinstance(snapshot, dict) and isinstance(snapshot.get(table_name), list):
        return snapshot[table_name]
    return []


def _runtime_data_table_summary(snapshot: Any) -> list[dict[str, Any]]:
    return [
        {
            "table": table_name,
            "present": isinstance(snapshot, dict) and isinstance(snapshot.get(table_name), list),
            "row_count": len(_runtime_data_rows(snapshot, table_name)),
            "raw_rows_exposed": False,
            "raw_headers_exposed": False,
            "headers_returned": False,
            "headers_redacted": True,
        }
        for table_name in RUNTIMEDATA_SELECTOR_CRITICAL_TABLES
    ]


def _runtime_data_source_metadata(path: Path, *, readable: bool = False, parseable: bool = False, source_fingerprint: str | None = None) -> dict[str, Any]:
    try:
        info = path.stat()
        present = path.is_file()
        return {
            "label": "runtime-authority-reference-active-snapshot",
            "present": present,
            "readable": bool(readable and present),
            "parseable": bool(parseable and present),
            "size_bytes": info.st_size if present else None,
            "modified_at": datetime.fromtimestamp(info.st_mtime, tz=timezone.utc).isoformat() if present else None,
            "source_fingerprint": source_fingerprint,
            "path_returned": False,
            "local_path_exposure_enabled": False,
        }
    except OSError as exc:
        return {
            "label": "runtime-authority-reference-active-snapshot",
            "present": False,
            "readable": False,
            "parseable": False,
            "size_bytes": None,
            "modified_at": None,
            "source_fingerprint": None,
            "path_returned": False,
            "local_path_exposure_enabled": False,
            "reason": getattr(exc, "errno", None) or exc.__class__.__name__,
        }


def _runtime_data_users_redaction_status(snapshot: Any) -> dict[str, Any]:
    users = _runtime_data_rows(snapshot, "USERS")
    return {
        "present": isinstance(snapshot, dict) and isinstance(snapshot.get("USERS"), list),
        "count": len(users),
        "raw_rows_exposed": False,
        "raw_headers_exposed": False,
        "personal_identifiers_exposed": False,
        "credentials_exposed": False,
    }


def _runtime_data_probe_base(**overrides: Any) -> dict[str, Any]:
    snapshot: dict[str, Any] = {}
    table_summary = _runtime_data_table_summary(snapshot)
    result: dict[str, Any] = {
        "ok": False,
        "source": _runtime_data_source_metadata(RUNTIMEDATA_ACTIVE_SOURCE_PATH),
        "loaded_read_only": False,
        "active_source_db_loaded_read_only": False,
        "server_side_only": True,
        "internal_probe_only": True,
        "public_route_added": False,
        "post_endpoint_added": False,
        "write_enabled": False,
        "write_attempted": False,
        "runtime_data_mutation_enabled": False,
        "raw_rows_exposed": False,
        "raw_headers_exposed": False,
        "raw_users_exposed": False,
        "raw_snapshot_returned": False,
        "raw_snapshot_serialized": False,
        "path_returned": False,
        "local_path_exposure_enabled": False,
        "source_path_label": "runtime-authority-reference-active-snapshot",
        "expected_tables": list(RUNTIMEDATA_SELECTOR_CRITICAL_TABLES),
        "present_tables": [],
        "missing_tables": list(RUNTIMEDATA_SELECTOR_CRITICAL_TABLES),
        "table_summary": table_summary,
        "users_redaction_status": _runtime_data_users_redaction_status(snapshot),
        "top_level_array_table_count": 0,
        "source_fingerprint_available": False,
        "blockers": [],
        "warnings": [],
    }
    result.update(overrides)
    return result



def _load_runtime_data_active_source_internal() -> tuple[dict[str, Any] | None, dict[str, Any]]:
    """Load the approved active RuntimeData source DB for internal probes only.

    The raw snapshot is returned to the caller in memory, but never included in
    the public metadata result. This mirrors runtime_data_active_source_probe()
    redaction rules while giving local-only evidence tools a controlled way to
    supply run_engine(selector_payload) with selector_payload.db.
    """
    path = RUNTIMEDATA_ACTIVE_SOURCE_PATH
    try:
        info = path.stat()
    except OSError as exc:
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-unavailable", "Active RuntimeData source DB is missing or unavailable.")],
            warnings=[getattr(exc, "strerror", None) or exc.__class__.__name__],
        )

    if not path.is_file():
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-file", "Active RuntimeData source path is not a file.")],
        )

    if info.st_size > MAX_RUNTIMEDATA_SOURCE_BYTES:
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-too-large", "Active RuntimeData source DB exceeds the controlled probe byte limit.")],
        )

    try:
        text = path.read_text(encoding="utf-8", errors="strict")
    except UnicodeError:
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-utf8", "Active RuntimeData source DB is not readable as UTF-8 JSON.")],
        )
    except OSError as exc:
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-readable", "Active RuntimeData source DB is not readable.")],
            warnings=[getattr(exc, "strerror", None) or exc.__class__.__name__],
        )

    source_fingerprint = hashlib.sha256(text.encode("utf-8")).hexdigest()
    try:
        snapshot = json.loads(text)
    except json.JSONDecodeError:
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path, readable=True, source_fingerprint=source_fingerprint),
            source_fingerprint_available=True,
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-json", "Active RuntimeData source DB is not parseable JSON.")],
        )

    if not isinstance(snapshot, dict):
        return None, _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path, readable=True, source_fingerprint=source_fingerprint),
            source_fingerprint_available=True,
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-table-object", "Active RuntimeData source DB parsed but did not contain a table object.")],
        )

    table_summary = _runtime_data_table_summary(snapshot)
    present_tables = [item["table"] for item in table_summary if item["present"]]
    missing_tables = [item["table"] for item in table_summary if not item["present"]]
    metadata = _runtime_data_probe_base(
        ok=True,
        source=_runtime_data_source_metadata(path, readable=True, parseable=True, source_fingerprint=source_fingerprint),
        loaded_read_only=True,
        active_source_db_loaded_read_only=True,
        present_tables=present_tables,
        missing_tables=missing_tables,
        table_summary=table_summary,
        users_redaction_status=_runtime_data_users_redaction_status(snapshot),
        top_level_array_table_count=len([value for value in snapshot.values() if isinstance(value, list)]),
        source_fingerprint_available=True,
        warnings=[f"Missing selector-critical RuntimeData table: {table}." for table in missing_tables],
    )
    return snapshot, metadata

@mcp.tool()
def runtime_data_active_source_probe() -> dict[str, Any]:
    """Load the active RuntimeData source DB read-only and return only redacted metadata/counts."""
    path = RUNTIMEDATA_ACTIVE_SOURCE_PATH
    try:
        info = path.stat()
    except OSError as exc:
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-unavailable", "Active RuntimeData source DB is missing or unavailable.")],
            warnings=[getattr(exc, "strerror", None) or exc.__class__.__name__],
        )

    if not path.is_file():
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-file", "Active RuntimeData source path is not a file.")],
        )

    if info.st_size > MAX_RUNTIMEDATA_SOURCE_BYTES:
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-too-large", "Active RuntimeData source DB exceeds the controlled probe byte limit.")],
        )

    try:
        text = path.read_text(encoding="utf-8", errors="strict")
    except UnicodeError:
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-utf8", "Active RuntimeData source DB is not readable as UTF-8 JSON.")],
        )
    except OSError as exc:
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path),
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-readable", "Active RuntimeData source DB is not readable.")],
            warnings=[getattr(exc, "strerror", None) or exc.__class__.__name__],
        )

    source_fingerprint = hashlib.sha256(text.encode("utf-8")).hexdigest()
    try:
        snapshot = json.loads(text)
    except json.JSONDecodeError:
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path, readable=True, source_fingerprint=source_fingerprint),
            source_fingerprint_available=True,
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-json", "Active RuntimeData source DB is not parseable JSON.")],
        )

    if not isinstance(snapshot, dict):
        return _runtime_data_probe_base(
            source=_runtime_data_source_metadata(path, readable=True, source_fingerprint=source_fingerprint),
            source_fingerprint_available=True,
            blockers=[_runtime_data_blocker("runtime-data-active-source-not-table-object", "Active RuntimeData source DB parsed but did not contain a table object.")],
        )

    table_summary = _runtime_data_table_summary(snapshot)
    present_tables = [item["table"] for item in table_summary if item["present"]]
    missing_tables = [item["table"] for item in table_summary if not item["present"]]
    return _runtime_data_probe_base(
        ok=True,
        source=_runtime_data_source_metadata(path, readable=True, parseable=True, source_fingerprint=source_fingerprint),
        loaded_read_only=True,
        active_source_db_loaded_read_only=True,
        present_tables=present_tables,
        missing_tables=missing_tables,
        table_summary=table_summary,
        users_redaction_status=_runtime_data_users_redaction_status(snapshot),
        top_level_array_table_count=len([value for value in snapshot.values() if isinstance(value, list)]),
        source_fingerprint_available=True,
        warnings=[f"Missing selector-critical RuntimeData table: {table}." for table in missing_tables],
    )



def _engine_readonly_invoke_base(**overrides: Any) -> dict[str, Any]:
    result: dict[str, Any] = {
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
        "donor_bridge_used": False,
        "donor_bridge_audit_jsonl_write_enabled": False,
        "audit_jsonl_write_attempted": False,
        "write_attempted": False,
        "runtime_data_mutation_enabled": False,
        "donor_data_mutation_enabled": False,
        "selected_result_persistence_enabled": False,
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
        "source_path_label": "runtime-authority-reference-active-snapshot",
        "source": _runtime_data_source_metadata(RUNTIMEDATA_ACTIVE_SOURCE_PATH),
        "source_summary": None,
        "candidate_field_status": [],
        "safe_engine_summary": None,
        "blockers": [],
        "warnings": [],
    }
    result.update(overrides)
    return result


def _engine_blocker(code: str, reason: str, severity: str = "blocking") -> dict[str, Any]:
    return {"code": code, "severity": severity, "reason": reason}


def _first_present(mapping: Mapping[str, Any], keys: list[str]) -> Any:
    for key in keys:
        value = mapping.get(key)
        if value not in (None, "", [], {}):
            return value
    return None


def _candidate_field_status(selector_payload: Mapping[str, Any]) -> list[dict[str, Any]]:
    lighting = selector_payload.get("lighting") if isinstance(selector_payload.get("lighting"), Mapping) else {}
    electrical = selector_payload.get("electrical") if isinstance(selector_payload.get("electrical"), Mapping) else {}
    tier_strategy = selector_payload.get("tier_strategy") if isinstance(selector_payload.get("tier_strategy"), Mapping) else {}
    runs = selector_payload.get("runs")

    tier_value = _first_present(selector_payload, ["tier", "tier_name"]) or _first_present(tier_strategy, ["selected_tier"])
    target_value = _first_present(lighting, ["target_lm_per_m", "lm_per_m", "Lumens per m", "targetLmPerM"])
    cct_value = _first_present(lighting, ["cct", "cct_direct", "cct_k"])
    cri_value = _first_present(lighting, ["cri", "cri_direct", "cri_rating"])
    optic_map = selector_payload.get("optic", {}) if isinstance(selector_payload.get("optic"), Mapping) else {}
    optic_value = _first_present(optic_map, ["key", "label"])
    optic_value = optic_value or _first_present(lighting, ["opticKey", "optic_key", "selected_optic_key"])
    control_value = _first_present(selector_payload, ["control_type"]) or _first_present(lighting, ["control_type", "controlType"])
    current_value = _first_present(electrical, ["current_ma", "currentMa"])

    def row(field: str, classification: str, present: bool, source: str, reason: str = "") -> dict[str, Any]:
        return {
            "field": field,
            "classification": classification,
            "present": bool(present),
            "source": source,
            "reason": reason,
            "raw_value_returned": False,
        }

    return [
        row("db", "internal-active-source", False, "runtimeDataReadOnlySourceAccessService", "Injected internally only; never caller supplied or returned."),
        row("tier", "candidate-supplied-source-backed-required", bool(tier_value), "selector_payload.tier or tier_strategy.selected_tier"),
        row("runs", "controlled-test-input-required", isinstance(runs, list) and len(runs) > 0, "selector_payload.runs"),
        row("lighting", "candidate-supplied-source-backed-required", isinstance(lighting, Mapping) and bool(lighting), "selector_payload.lighting"),
        row("target_lm_per_m", "candidate-supplied-source-backed-required", target_value is not None, "selector_payload.lighting"),
        row("cct", "candidate-supplied-source-backed-required", cct_value is not None, "selector_payload.lighting"),
        row("cri", "candidate-supplied-source-backed-required", cri_value is not None, "selector_payload.lighting"),
        row("optic", "candidate-supplied-source-backed-required", optic_value is not None, "selector_payload.optic or lighting"),
        row("control_type", "candidate-supplied-source-backed-required", control_value is not None, "selector_payload.control_type or lighting"),
        row("current_ma", "optional-engine-derivable", current_value is not None, "selector_payload.electrical", "May be derived by donor Engine only when source data supports it."),
    ]


def _candidate_blockers(selector_payload: Any) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if not isinstance(selector_payload, Mapping):
        return [], [_engine_blocker("selector-payload-required", "selector_payload must be a JSON object.")]
    if "db" in selector_payload:
        return _candidate_field_status(selector_payload), [
            _engine_blocker("caller-supplied-db-refused", "The internal seam loads the active source DB itself; caller-supplied db is refused."),
        ]

    status = _candidate_field_status(selector_payload)
    blockers = [
        _engine_blocker(f"missing-candidate-field-{item['field']}", f"Required Engine candidate field is missing: {item['field']}.")
        for item in status
        if item["classification"].endswith("required") and not item["present"]
    ]
    return status, blockers


def _safe_count(value: Any) -> int:
    return len(value) if isinstance(value, list) else 0


def _safe_engine_runs(engine_result: Mapping[str, Any]) -> list[Any]:
    rough_payload = engine_result.get("rough_electrical_payload")
    if isinstance(rough_payload, Mapping) and isinstance(rough_payload.get("runs"), list):
        return rough_payload.get("runs") or []
    payload = engine_result.get("payload")
    if isinstance(payload, Mapping) and isinstance(payload.get("runs"), list):
        return payload.get("runs") or []
    runs = engine_result.get("runs")
    return runs if isinstance(runs, list) else []


def _safe_engine_result_summary(engine_result: Any) -> dict[str, Any]:
    if not isinstance(engine_result, Mapping):
        return {
            "success": False,
            "run_count": 0,
            "error_count": 1,
            "warning_count": 0,
            "first_error": "Engine did not return an object.",
            "first_warning": "",
            "runs": [],
        }

    errors = engine_result.get("errors") if isinstance(engine_result.get("errors"), list) else []
    warnings = engine_result.get("warnings") if isinstance(engine_result.get("warnings"), list) else []
    runs = _safe_engine_runs(engine_result)
    safe_runs: list[dict[str, Any]] = []
    for index, run in enumerate(runs[:50]):
        run_map = run if isinstance(run, Mapping) else {}
        mechanical = run_map.get("mechanical") if isinstance(run_map.get("mechanical"), Mapping) else {}
        zone_plan = run_map.get("zone_plan") if isinstance(run_map.get("zone_plan"), Mapping) else {}
        safe_runs.append({
            "index": index,
            "has_body_requested": "body_mm_requested" in run_map,
            "segments_count": _safe_count(run_map.get("segments")),
            "reserved_ranges_count": _safe_count(run_map.get("reserved_ranges")),
            "boards_count": _safe_count(run_map.get("boards")),
            "gear_tray_plan_count": _safe_count(run_map.get("gear_tray_plan")),
            "suspension_points_count": _safe_count(run_map.get("suspension_points_mm") or mechanical.get("suspension_points_mm")),
            "clip_points_count": _safe_count(run_map.get("clip_points_mm") or mechanical.get("clip_points_mm")),
            "zone_count": _safe_count(zone_plan.get("zones")),
            "raw_run_returned": False,
        })

    tier_evaluation = engine_result.get("tier_evaluation") if isinstance(engine_result.get("tier_evaluation"), Mapping) else {}
    selected_solution = engine_result.get("selected_solution") if isinstance(engine_result.get("selected_solution"), Mapping) else {}
    return {
        "success": bool(engine_result.get("success", False)),
        "run_count": len(runs),
        "error_count": len(errors),
        "warning_count": len(warnings),
        "first_error": str(errors[0])[:240] if errors else "",
        "first_warning": str(warnings[0])[:240] if warnings else "",
        "selected_tier": str(tier_evaluation.get("selected_tier") or selected_solution.get("tier") or "")[:80],
        "output_contract_ready": bool(engine_result.get("output_contract_ready", False)),
        "runs": safe_runs,
        "raw_result_returned": False,
        "raw_debug_returned": False,
        "raw_rough_electrical_payload_returned": False,
    }


@mcp.tool()
def engine_runtable_internal_readonly_invoke_probe(selector_payload: dict[str, Any] | None = None, execute: bool = False) -> dict[str, Any]:
    """Internal evidence-only seam for donor run_engine with active RuntimeData DB in memory.

    No public route or POST endpoint is added. The caller may provide a candidate
    selector payload but not a db object or file path. The approved active source
    DB is loaded internally and passed to donor run_engine only in process memory
    when execute=True and required candidate fields are present. Only safe
    summaries/blockers are returned.
    """
    candidate = selector_payload if isinstance(selector_payload, dict) else {}
    candidate_status, candidate_blockers = _candidate_blockers(candidate)
    snapshot, source_meta = _load_runtime_data_active_source_internal()

    source_summary = {
        "ok": bool(source_meta.get("ok")),
        "source": source_meta.get("source"),
        "present_tables": source_meta.get("present_tables", []),
        "missing_tables": source_meta.get("missing_tables", []),
        "table_summary": source_meta.get("table_summary", []),
        "users_redaction_status": source_meta.get("users_redaction_status", {}),
        "source_fingerprint_available": bool(source_meta.get("source_fingerprint_available")),
        "raw_rows_exposed": False,
        "raw_users_exposed": False,
        "raw_snapshot_returned": False,
    }

    blockers = []
    blockers.extend(source_meta.get("blockers", []))
    blockers.extend(candidate_blockers)
    if not execute:
        blockers.append(_engine_blocker("execute-flag-not-set", "The seam is available but Engine execution was not requested."))

    base = _engine_readonly_invoke_base(
        ok=False,
        source=source_meta.get("source"),
        source_summary=source_summary,
        active_source_db_loaded_read_only=bool(source_meta.get("active_source_db_loaded_read_only")),
        candidate_field_status=candidate_status,
        blockers=blockers,
        warnings=[
            "Donor bridge is deliberately avoided because it writes audit JSONL.",
            "Raw active DB rows are held only in local process memory and are never returned.",
        ],
    )

    if blockers:
        return base

    if snapshot is None:
        return _engine_readonly_invoke_base(
            source_summary=source_summary,
            blockers=[_engine_blocker("active-source-snapshot-unavailable", "Active source snapshot was not available for in-memory invocation.")],
        )

    donor_root = DONOR_REFERENCE_ROOT
    if not donor_root.exists():
        return _engine_readonly_invoke_base(
            source_summary=source_summary,
            candidate_field_status=candidate_status,
            blockers=[_engine_blocker("donor-reference-root-unavailable", "Donor reference root is unavailable, so direct run_engine cannot be imported.")],
        )

    payload = dict(candidate)
    payload["db"] = snapshot
    payload.setdefault("disable_run_memo", True)

    inserted = False
    donor_root_text = str(donor_root)
    if donor_root_text not in sys.path:
        sys.path.insert(0, donor_root_text)
        inserted = True

    started = time.monotonic()
    try:
        from lib.planning.run_engine import run_engine  # type: ignore

        engine_result = run_engine(payload)
    except Exception as exc:  # noqa: BLE001 - safe diagnostic summary only
        return _engine_readonly_invoke_base(
            ok=False,
            source=source_meta.get("source"),
            source_summary=source_summary,
            active_source_db_loaded_read_only=True,
            active_source_db_passed_in_memory_only=True,
            candidate_field_status=candidate_status,
            engine_execution_attempted=True,
            blockers=[_engine_blocker("direct-run-engine-exception", f"Direct donor run_engine raised {exc.__class__.__name__}.")],
            warnings=["Exception message redacted to avoid leaking raw payload/source details."],
        )
    finally:
        if inserted:
            try:
                sys.path.remove(donor_root_text)
            except ValueError:
                pass

    duration_ms = int((time.monotonic() - started) * 1000)
    safe_summary = _safe_engine_result_summary(engine_result)
    result_blockers = [] if safe_summary.get("success") else [
        _engine_blocker("direct-run-engine-no-success", "Direct donor run_engine executed but did not produce a successful Engine result."),
    ]
    return _engine_readonly_invoke_base(
        ok=bool(safe_summary.get("success")),
        source=source_meta.get("source"),
        source_summary=source_summary,
        active_source_db_loaded_read_only=True,
        active_source_db_passed_in_memory_only=True,
        candidate_field_status=candidate_status,
        engine_execution_attempted=True,
        engine_result_produced=bool(safe_summary.get("success")),
        safe_engine_summary={**safe_summary, "duration_ms": duration_ms},
        blockers=result_blockers,
        warnings=["Direct donor run_engine was invoked without donor bridge or audit JSONL write."],
    )

@mcp.tool()
def repo_info() -> dict[str, Any]:
    """Return both configured roots, webhook base, transport mode, and enabled flags."""
    return {
        "runtime_root": str(RUNTIME_ROOT),
        "runtime_exists": RUNTIME_ROOT.exists(),
        "donor_reference_root": str(DONOR_REFERENCE_ROOT),
        "donor_reference_exists": DONOR_REFERENCE_ROOT.exists(),
        "runtime_data_active_source_probe_available": True,
        "engine_runtable_internal_readonly_invoke_probe_available": True,
        "runtime_data_active_source_exists": RUNTIMEDATA_ACTIVE_SOURCE_PATH.exists(),
        "runtime_data_active_source_path_returned": False,
        "transport": ACTIVE_TRANSPORT,
        "http_host": HTTP_HOST,
        "http_port": HTTP_PORT,
        "http_path": HTTP_PATH,
        "webhook_base_url": WEBHOOK_BASE_URL,
        "write_enabled": ENABLE_WRITE,
        "arbitrary_shell_execution": False,
        "allowed_roots": ["runtime", "repo", "donor"],
        "runtime_gate_command": FIXED_GATE_COMMAND,
    }


@mcp.tool()
def list_repo_directory(relative_path: str = ".", recursive: bool = False, max_entries: int = DEFAULT_MAX_DIR_ENTRIES, root: str = "runtime") -> dict[str, Any]:
    """List files and folders inside the selected ControlStack root."""
    if max_entries < 1:
        raise ValueError("max_entries must be >= 1")
    label = _root_label(root)
    target = _resolve_path(label, relative_path)
    if not target.exists():
        raise FileNotFoundError(f"Directory does not exist: {target}")
    if not target.is_dir():
        raise NotADirectoryError(f"Path is not a directory: {target}")
    iterator = target.rglob("*") if recursive else target.iterdir()
    entries: list[dict[str, Any]] = []
    truncated = False
    for index, item in enumerate(sorted(iterator, key=lambda p: str(p).lower())):
        if index >= max_entries:
            truncated = True
            break
        stat = item.stat()
        entries.append({"relative_path": _rel(label, item), "name": item.name, "is_dir": item.is_dir(), "size_bytes": stat.st_size})
    return {"root": label, "root_path": str(_root_path(label)), "target": str(target), "relative_path": _rel(label, target), "recursive": recursive, "count": len(entries), "max_entries": max_entries, "truncated": truncated, "entries": entries}


@mcp.tool()
def read_repo_file(relative_path: str, start_line: int = 1, end_line: int | None = None, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Read a UTF-8 text file from the selected root, optionally by line range."""
    if start_line < 1:
        raise ValueError("start_line must be >= 1")
    if end_line is not None and end_line < start_line:
        raise ValueError("end_line must be >= start_line")
    label = _root_label(root)
    target = _resolve_path(label, relative_path)
    if not target.exists():
        raise FileNotFoundError(f"File does not exist: {target}")
    if not target.is_file():
        raise IsADirectoryError(f"Path is not a file: {target}")
    text = _read_text_file(target)
    lines = text.splitlines()
    selected_lines = lines[start_line - 1 : (end_line if end_line is not None else len(lines))]
    body, truncated = _clip_text("\n".join(selected_lines), max_chars)
    return {"root": label, "root_path": str(_root_path(label)), "relative_path": _rel(label, target), "absolute_path": str(target), "start_line": start_line, "end_line": end_line or len(lines), "line_count_total": len(lines), "line_count_returned": len(selected_lines), "truncated": truncated, "content": body}


@mcp.tool()
def write_repo_file(relative_path: str, content: str, overwrite: bool = True, make_parents: bool = True, root: str = "runtime") -> dict[str, Any]:
    """Write a UTF-8 file inside the runtime root."""
    _require_runtime(root)
    _require_write_enabled()
    _reject_bad_path_string(relative_path)
    target = _resolve_path("runtime", relative_path)
    if target.exists() and target.is_dir():
        raise IsADirectoryError(f"Path is a directory, not a file: {target}")
    if target.exists() and not overwrite:
        raise FileExistsError(f"File already exists and overwrite=False: {target}")
    if make_parents:
        target.parent.mkdir(parents=True, exist_ok=True)
    elif not target.parent.exists():
        raise FileNotFoundError(f"Parent directory does not exist: {target.parent}")
    existed = target.exists()
    before = target.stat().st_size if existed else 0
    target.write_text(content, encoding="utf-8", newline="\n")
    return {"ok": True, "root": "runtime", "root_path": str(RUNTIME_ROOT), "relative_path": _rel("runtime", target), "absolute_path": str(target), "changed": True, "created": not existed, "overwritten": existed, "bytes_before": before, "bytes_written": target.stat().st_size, "newline": "\\n"}


@mcp.tool()
def compare_repo_files(left_root: str, left_path: str, right_root: str, right_path: str, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Compare one file in one configured root with one file in another configured root."""
    lroot = _root_label(left_root)
    rroot = _root_label(right_root)
    left = _resolve_path(lroot, left_path)
    right = _resolve_path(rroot, right_path)
    if not left.is_file() or not right.is_file():
        raise FileNotFoundError("Both comparison targets must exist and be files")
    left_text = _read_text_file(left)
    right_text = _read_text_file(right)
    diff = "".join(difflib.unified_diff(left_text.splitlines(True), right_text.splitlines(True), fromfile=f"{lroot}/{_rel(lroot, left)}", tofile=f"{rroot}/{_rel(rroot, right)}"))
    body, truncated = _clip_text(diff, max_chars)
    return {"ok": True, "same": left_text == right_text, "left": _rel(lroot, left), "right": _rel(rroot, right), "diff": body, "truncated": truncated}


@mcp.tool()
def copy_between_roots(from_root: str, from_path: str, to_root: str, to_path: str, overwrite: bool = False, dry_run: bool = True, make_parents: bool = True) -> dict[str, Any]:
    """Copy a file from one configured root to another. Destination must be runtime."""
    return _copy_file_between(from_root, from_path, to_root, to_path, overwrite=overwrite, dry_run=dry_run, make_parents=make_parents)


@mcp.tool()
def copy_repo_file(from_path: str, to_path: str, dry_run: bool = True, timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Copy one file inside the runtime root. Destination overwrite is refused."""
    return _copy_file_between(root, from_path, root, to_path, overwrite=False, dry_run=dry_run, make_parents=True)


@mcp.tool()
def move_between_roots(from_root: str, from_path: str, to_root: str, to_path: str, overwrite: bool = False, dry_run: bool = True, make_parents: bool = True) -> dict[str, Any]:
    """Move a file from one configured root to another. Non-dry moves are runtime-only."""
    if _root_label(from_root) != "runtime" or _root_label(to_root) != "runtime":
        if dry_run:
            preview = _copy_file_between(from_root, from_path, to_root, to_path, overwrite=overwrite, dry_run=True, make_parents=make_parents)
            preview["ok"] = False
            preview["message"] = "Non-dry moves are runtime-only because donor roots are read-only."
            return preview
        raise PermissionError("Moves are runtime-only. Donor reference is read-only.")
    result = _copy_file_between("runtime", from_path, "runtime", to_path, overwrite=overwrite, dry_run=dry_run, make_parents=make_parents)
    result["operation"] = "move_between_roots"
    if not dry_run:
        _resolve_path("runtime", from_path).unlink()
        result["source_deleted"] = True
    return result


@mcp.tool()
def move_repo_file(from_path: str, to_path: str, dry_run: bool = True, timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Move one file inside the runtime root. Dry-run defaults to true."""
    _require_runtime(root)
    return move_between_roots("runtime", from_path, "runtime", to_path, overwrite=False, dry_run=dry_run, make_parents=True)


@mcp.tool()
def move_repo_directory(from_path: str, to_path: str, dry_run: bool = True, skip_subdirs: list[str] | None = None, timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Move one directory inside the runtime root. Dry-run defaults to true."""
    _require_runtime(root)
    _reject_bad_path_string(from_path)
    _reject_bad_path_string(to_path)
    source = _resolve_path("runtime", from_path)
    target = _resolve_path("runtime", to_path)
    if not source.exists() or not source.is_dir():
        raise NotADirectoryError(f"Source directory does not exist: {from_path}")
    if target.exists():
        raise FileExistsError(f"Destination already exists: {to_path}")
    skipped = set(skip_subdirs or [])
    entries = []
    for item in source.rglob("*"):
        rel = item.relative_to(source).as_posix()
        if any(rel == s or rel.startswith(s.rstrip("/") + "/") for s in skipped):
            continue
        entries.append(rel)
    payload = {"ok": True, "root": "runtime", "from_path": _rel("runtime", source), "to_path": _rel("runtime", target), "dry_run": dry_run, "changed": False, "entry_count": len(entries), "skipped_subdirs": sorted(skipped)}
    if dry_run:
        return payload
    _require_write_enabled()
    shutil.move(str(source), str(target))
    payload["changed"] = True
    return payload


@mcp.tool()
def promote_to_runtime(from_path: str, to_path: str | None = None, overwrite: bool = False, dry_run: bool = True, make_parents: bool = True) -> dict[str, Any]:
    """Promote one donor-reference file into the runtime root. Dry-run defaults to true."""
    return _copy_file_between("donor", from_path, "runtime", to_path or from_path, overwrite=overwrite, dry_run=dry_run, make_parents=make_parents)


@mcp.tool()
def delete_runtime_file(relative_path: str, dry_run: bool = True) -> dict[str, Any]:
    """Legacy alias: delete one explicit file inside the runtime root."""
    return delete_repo_file(relative_path=relative_path, root="runtime", dry_run=dry_run)


@mcp.tool()
def delete_repo_file(relative_path: str, dry_run: bool = True, timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Delete one explicit file inside the runtime root. Dry-run defaults to true."""
    _require_runtime(root)
    _reject_bad_path_string(relative_path)
    target = _resolve_path("runtime", relative_path)
    exists = target.exists()
    is_file = target.is_file()
    payload: dict[str, Any] = {
        "ok": dry_run or (exists and is_file),
        "root": "runtime",
        "root_path": str(RUNTIME_ROOT),
        "relative_path": _rel("runtime", target),
        "absolute_path": str(target),
        "dry_run": dry_run,
        "exists": exists,
        "is_file": is_file,
        "changed": False,
        "would_delete": dry_run and exists and is_file,
        "bytes_deleted": target.stat().st_size if exists and is_file else 0,
    }
    if not exists:
        payload["message"] = "File does not exist; no deletion performed."
        return payload
    if not is_file:
        payload["ok"] = False
        payload["error"] = "path_is_not_a_file"
        return payload
    if dry_run:
        return payload
    _require_write_enabled()
    target.unlink()
    payload["changed"] = True
    payload["would_delete"] = False
    return payload


@mcp.tool()
def repo_find_files(root: str = "runtime", pattern: str = "*", mode: str = "glob", max_results: int = 200, relative_path: str = ".") -> dict[str, Any]:
    """Find files by glob, substring, or regex in the selected root."""
    label = _root_label(root)
    if mode not in {"glob", "substring", "regex"}:
        raise ValueError("mode must be glob, substring, or regex")
    rx = re.compile(pattern) if mode == "regex" else None
    entries: list[dict[str, Any]] = []
    for path in _iter_files(label, relative_path):
        if len(entries) >= max_results:
            break
        relp = _rel(label, path)
        if mode == "glob":
            matched = fnmatch.fnmatch(relp, pattern) or fnmatch.fnmatch(path.name, pattern)
        elif mode == "substring":
            matched = pattern.lower() in relp.lower()
        else:
            matched = bool(rx and rx.search(relp))
        if matched:
            stat = path.stat()
            entries.append({"relative_path": relp, "name": path.name, "size_bytes": stat.st_size, "modified_utc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()})
    return {"ok": True, "root": label, "root_path": str(_root_path(label)), "pattern": pattern, "mode": mode, "count": len(entries), "truncated": len(entries) >= max_results, "entries": entries}


@mcp.tool()
def repo_grep(root: str = "runtime", query: str = "", case_sensitive: bool = False, regex: bool = False, include_globs: list[str] | None = None, exclude_globs: list[str] | None = None, max_results: int = 100, context_lines: int = 2, relative_path: str = ".") -> dict[str, Any]:
    """Text search across files in the selected root."""
    if not query:
        raise ValueError("query is required")
    label = _root_label(root)
    rx = re.compile(query if regex else re.escape(query), 0 if case_sensitive else re.IGNORECASE)
    max_results = max(1, min(int(max_results), 2_000))
    context_lines = max(0, min(int(context_lines), 10))
    results: list[dict[str, Any]] = []
    searched = 0
    for path in _iter_files(label, relative_path, include_globs, exclude_globs):
        if len(results) >= max_results:
            break
        try:
            if path.stat().st_size > MAX_TEXT_BYTES or _is_binary(path):
                continue
            lines = _read_text_file(path).splitlines()
        except OSError:
            continue
        searched += 1
        for idx, line in enumerate(lines):
            if rx.search(line):
                before = lines[max(0, idx - context_lines) : idx]
                after = lines[idx + 1 : min(len(lines), idx + context_lines + 1)]
                results.append({"relative_path": _rel(label, path), "line_number": idx + 1, "line_text": line[:500], "before": before, "after": after})
                if len(results) >= max_results:
                    break
    return {"ok": True, "root": label, "root_path": str(_root_path(label)), "query": query, "searched_files": searched, "count": len(results), "truncated": len(results) >= max_results, "results": results}


@mcp.tool()
def repo_safe_patch(root: str = "runtime", relative_path: str = "", operation: str = "replace_text", target: str = "", replacement: str = "", occurrence: int = 1, dry_run: bool = True) -> dict[str, Any]:
    """Apply or preview a structured safe edit to one selected-root file."""
    _require_runtime(root)
    _reject_bad_path_string(relative_path)
    target_path = _resolve_path("runtime", relative_path)
    if not target_path.exists() or not target_path.is_file():
        raise FileNotFoundError(f"File does not exist or is not a file: {relative_path}")
    if _is_binary(target_path):
        raise ValueError("Binary files cannot be patched with repo_safe_patch")
    op = str(operation or "").strip().lower()
    before = _read_text_file(target_path)
    replacements = 0
    if op == "replace_text":
        after, replacements = _replace_nth(before, target, replacement, int(occurrence))
    elif op == "insert_before":
        after, replacements = _replace_nth(before, target, replacement + target, int(occurrence))
    elif op == "insert_after":
        after, replacements = _replace_nth(before, target, target + replacement, int(occurrence))
    elif op == "append_text":
        after = before + replacement
        replacements = 1
    elif op == "prepend_text":
        after = replacement + before
        replacements = 1
    else:
        raise ValueError("operation must be replace_text, insert_before, insert_after, append_text, or prepend_text")
    changed = before != after
    preview, preview_truncated = _clip_text("".join(difflib.unified_diff(before.splitlines(True), after.splitlines(True), fromfile=f"a/{_rel('runtime', target_path)}", tofile=f"b/{_rel('runtime', target_path)}")), DEFAULT_MAX_CHARS)
    if changed and not dry_run:
        _require_write_enabled()
        target_path.write_text(after, encoding="utf-8", newline="\n")
    return {"ok": True, "root": "runtime", "root_path": str(RUNTIME_ROOT), "relative_path": _rel("runtime", target_path), "operation": op, "occurrence": occurrence, "dry_run": dry_run, "matched_replacements": replacements, "changed": changed and not dry_run, "would_change": changed and dry_run, "bytes_before": len(before.encode("utf-8")), "bytes_after": len(after.encode("utf-8")), "diff_preview": preview, "truncated": preview_truncated}


@mcp.tool()
def repo_scope_guard(root: str = "runtime", allowed_paths: list[str] | None = None, candidate_paths: list[str] | None = None) -> dict[str, Any]:
    """Check whether candidate paths stay within declared glob scope."""
    label = _root_label(root)
    allowed = allowed_paths or []
    candidates = candidate_paths or []
    results = []
    for candidate in candidates:
        rel = _rel(label, _resolve_path(label, candidate))
        matched = any(fnmatch.fnmatch(rel, pattern) or rel.startswith(pattern.rstrip("/") + "/") for pattern in allowed)
        results.append({"path": candidate, "normalised": rel, "allowed": matched})
    return {"ok": all(item["allowed"] for item in results), "root": label, "allowed_paths": allowed, "results": results}


@mcp.tool()
def repo_apply_unified_diff(root: str = "runtime", diff_text: str = "", dry_run: bool = True, allow_new_files: bool = True) -> dict[str, Any]:
    """Apply or preview a unified diff in runtime with path confinement guards."""
    _require_runtime(root)
    if not diff_text.strip():
        raise ValueError("diff_text is required")
    if not allow_new_files and any(line.startswith("--- /dev/null") for line in diff_text.splitlines()):
        raise PermissionError("New files are refused when allow_new_files=False")
    touched_paths = _extract_diff_paths(diff_text)
    if not touched_paths:
        raise ValueError("No confined file paths could be extracted from diff_text")
    check = _run_git(["apply", "--check", "--whitespace=nowarn", "-"], timeout_s=60, max_chars=DEFAULT_MAX_CHARS, input_text=diff_text)
    if dry_run or not check.get("ok"):
        return {"ok": bool(check.get("ok")), "root": "runtime", "root_path": str(RUNTIME_ROOT), "dry_run": dry_run, "changed": False, "touched_paths": touched_paths, "check": check, "apply": None}
    _require_write_enabled()
    applied = _run_git(["apply", "--whitespace=nowarn", "-"], timeout_s=60, max_chars=DEFAULT_MAX_CHARS, input_text=diff_text)
    return {"ok": bool(applied.get("ok")), "root": "runtime", "root_path": str(RUNTIME_ROOT), "dry_run": dry_run, "changed": bool(applied.get("ok")), "touched_paths": touched_paths, "check": check, "apply": applied}


@mcp.tool()
def repo_affected_gate_plan(root: str = "runtime", changed_files: list[str] | None = None) -> dict[str, Any]:
    """Suggest which whitelisted gates should run for changed files."""
    _require_runtime(root)
    files = changed_files or (_git_status_details().get("modified", []) + _git_status_details().get("staged", []) + _git_status_details().get("untracked", []))
    gates = ["selector"] if any(path.startswith(("apps/", "packages/", "server/", "scripts/", "tools/")) for path in files) else ["test"]
    return {"ok": True, "root": "runtime", "changed_files": sorted(set(files)), "recommended_gates": gates, "allowed_gates": sorted(ALLOWED_GATES)}


@mcp.tool()
def repo_dependency_map(root: str = "runtime", relative_path: str = "", depth: int = 2, max_nodes: int = 200) -> dict[str, Any]:
    """Return local dependency relationships for one file or module."""
    label = _root_label(root)
    target = _resolve_path(label, relative_path or ".")
    imports: list[str] = []
    if target.is_file() and target.suffix == ".py":
        try:
            tree = __import__("ast").parse(_read_text_file(target))
            for node in __import__("ast").walk(tree):
                if node.__class__.__name__ == "Import":
                    imports.extend(alias.name for alias in node.names)
                elif node.__class__.__name__ == "ImportFrom" and node.module:
                    imports.append(node.module)
        except Exception:
            imports = []
    elif target.is_file():
        text = _read_text_file(target) if not _is_binary(target) else ""
        imports = re.findall(r"(?:from|import)\s+['\"]([^'\"]+)['\"]", text)[:max_nodes]
    return {"ok": True, "root": label, "relative_path": _rel(label, target), "depth": depth, "max_nodes": max_nodes, "imports": imports[:max_nodes]}


@mcp.tool()
def repo_symbol_search(root: str = "runtime", symbol: str = "", language_hint: str | None = None, max_results: int = 100) -> dict[str, Any]:
    """Lightweight Python and JS/TS symbol discovery."""
    if not symbol:
        raise ValueError("symbol is required")
    label = _root_label(root)
    globs = ["*.py"] if language_hint == "python" else ["*.py", "*.js", "*.jsx", "*.ts", "*.tsx"]
    results = []
    rx = re.compile(rf"\b(class|def|function|const|let|var|export\s+function)\s+{re.escape(symbol)}\b")
    for path in _iter_files(label, ".", include_globs=globs):
        if len(results) >= max_results:
            break
        if _is_binary(path):
            continue
        for idx, line in enumerate(_read_text_file(path).splitlines(), 1):
            if rx.search(line) or symbol in line:
                results.append({"relative_path": _rel(label, path), "line_number": idx, "line_text": line[:500]})
                break
    return {"ok": True, "root": label, "symbol": symbol, "count": len(results), "results": results}


@mcp.tool()
def repo_noise_audit(root: str = "runtime", relative_path: str = ".", max_results: int = 200) -> dict[str, Any]:
    """Identify suspicious junk/noise files under selected root."""
    label = _root_label(root)
    findings = []
    for path in _iter_files(label, relative_path, max_files=50_000):
        if len(findings) >= max_results:
            break
        rel = _rel(label, path)
        reason = _git_index_junk_reason(rel)
        if reason or path.name.endswith((".tmp", ".orig", ".rej")):
            findings.append({"relative_path": rel, "reason": reason or "temporary/patch artifact"})
    return {"ok": True, "root": label, "relative_path": relative_path, "count": len(findings), "truncated": len(findings) >= max_results, "findings": findings}


@mcp.tool()
def repo_handoff_update(source_root: str = "runtime", target_root: str = "runtime", items: list[dict[str, Any]] | None = None, notes: str = "", write_summary_file: bool = True) -> dict[str, Any]:
    """Track donor-to-runtime migration state in a guarded runtime summary file."""
    _require_runtime(target_root)
    payload = {"updated_utc": datetime.now(timezone.utc).isoformat(), "source_root": _root_label(source_root), "target_root": _root_label(target_root), "items": items or [], "notes": notes}
    path = "docs/runtime_handoff_update.json"
    if not write_summary_file:
        return {"ok": True, "dry_run": True, "would_write": path, "payload": payload}
    return write_repo_file(path, json.dumps(payload, indent=2) + "\n", overwrite=True, make_parents=True, root="runtime")


@mcp.tool()
def run_controlstack_gate(gate: str, changed_files: list[str] | None = None, timeout_s: int = 1800, max_chars: int = DEFAULT_MAX_CHARS, root: str = "runtime") -> dict[str, Any]:
    """Run a named, whitelisted ControlStack quality gate in the runtime root."""
    global LAST_RUNTIME_GATE_RESULT
    _require_runtime(root)
    gate_name = str(gate or "").strip().lower()
    if gate_name not in ALLOWED_GATES:
        result = {"ok": False, "gate": gate_name, "root": str(RUNTIME_ROOT), "command": FIXED_GATE_COMMAND, "exit_code": 2, "returncode": 2, "stdout": "", "stderr": f"Unsupported gate: {gate_name}", "duration_s": 0.0, "truncated": False, "error": "disallowed_gate"}
        LAST_RUNTIME_GATE_RESULT = result
        return result
    script_path = RUNTIME_ROOT / "scripts" / "controlstack_gate.py"
    if not script_path.exists():
        result = {"ok": False, "gate": gate_name, "root": str(RUNTIME_ROOT), "command": [str(script_path), gate_name], "exit_code": 127, "returncode": 127, "stdout": "", "stderr": f"Gate runner not found: {script_path}", "duration_s": 0.0, "truncated": False, "error": "gate_runner_not_found"}
        LAST_RUNTIME_GATE_RESULT = result
        return result
    cmd = [sys.executable, str(script_path), gate_name, "--json", "--max-chars", str(max_chars)]
    started = time.monotonic()
    try:
        proc = subprocess.run(cmd, cwd=str(RUNTIME_ROOT), env=_safe_env_for_child(), capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout_s, shell=False)
    except subprocess.TimeoutExpired:
        result = {"ok": False, "gate": gate_name, "root": str(RUNTIME_ROOT), "command": FIXED_GATE_COMMAND, "exit_code": 124, "returncode": 124, "stdout": "", "stderr": f"timeout after {timeout_s}s", "duration_s": round(time.monotonic() - started, 3), "truncated": False, "error": "timeout"}
        LAST_RUNTIME_GATE_RESULT = result
        return result
    stdout, stdout_truncated = _clip_text(proc.stdout or "", max_chars)
    stderr, stderr_truncated = _clip_text(proc.stderr or "", max_chars)
    parsed = _try_parse_json(stdout)
    if isinstance(parsed, dict):
        result = parsed
        result.setdefault("ok", proc.returncode == 0)
        result.setdefault("gate", gate_name)
        result.setdefault("root", str(RUNTIME_ROOT))
        result.setdefault("command", FIXED_GATE_COMMAND)
        result.setdefault("exit_code", proc.returncode)
        result.setdefault("returncode", proc.returncode)
        result.setdefault("stdout", "")
        result.setdefault("stderr", stderr)
        result.setdefault("duration_s", round(time.monotonic() - started, 3))
        result.setdefault("truncated", stdout_truncated or stderr_truncated)
    else:
        result = {"ok": proc.returncode == 0, "gate": gate_name, "root": str(RUNTIME_ROOT), "command": FIXED_GATE_COMMAND, "exit_code": proc.returncode, "returncode": proc.returncode, "stdout": stdout, "stderr": stderr, "duration_s": round(time.monotonic() - started, 3), "truncated": stdout_truncated or stderr_truncated}
    LAST_RUNTIME_GATE_RESULT = result
    return result


@mcp.tool()
def repo_git_status(root: str = "runtime") -> dict[str, Any]:
    """Show git status for selected root if it is a git repo."""
    _require_runtime(root)
    return _git_status_details()


@mcp.tool()
def repo_git_stage(paths: list[str], root: str = "runtime", dry_run: bool = True, allow_junk: bool = False) -> dict[str, Any]:
    """Safely stage explicit file paths in runtime. Dry-run defaults to true."""
    _require_runtime(root)
    accepted_paths, rejected_paths = _prepare_git_index_paths(paths, require_existing_files=True, allow_missing=False, allow_junk=allow_junk)
    command_args = ["add", "--", *accepted_paths]
    git_result = None
    changed = False
    if accepted_paths and not dry_run:
        _require_write_enabled()
        git_result = _run_git(command_args, timeout_s=30, max_chars=50_000)
        changed = bool(git_result.get("ok"))
    status_preview = _run_git(["status", "--porcelain=v1", "-b", "--", *accepted_paths], max_chars=50_000) if accepted_paths else None
    return {"ok": bool(accepted_paths) and (git_result is None or bool(git_result.get("ok"))), "root": "runtime", "root_path": str(RUNTIME_ROOT), "requested_paths": paths, "accepted_paths": accepted_paths, "rejected_paths": rejected_paths, "rejection_reasons": rejected_paths, "dry_run": dry_run, "allow_junk": allow_junk, "changed": changed, "command_preview": ["git", *command_args], "git_result": git_result, "resulting_git_status_preview": status_preview}


@mcp.tool()
def repo_git_unstage(paths: list[str], root: str = "runtime", dry_run: bool = True) -> dict[str, Any]:
    """Safely unstage explicit paths without touching working-tree changes."""
    _require_runtime(root)
    accepted_paths, rejected_paths = _prepare_git_index_paths(paths, require_existing_files=False, allow_missing=True, allow_junk=True)
    command_args = ["restore", "--staged", "--", *accepted_paths]
    git_result = None
    changed = False
    if accepted_paths and not dry_run:
        _require_write_enabled()
        git_result = _run_git(command_args, timeout_s=30, max_chars=50_000)
        changed = bool(git_result.get("ok"))
    status_preview = _run_git(["status", "--porcelain=v1", "-b", "--", *accepted_paths], max_chars=50_000) if accepted_paths else None
    return {"ok": bool(accepted_paths) and (git_result is None or bool(git_result.get("ok"))), "root": "runtime", "root_path": str(RUNTIME_ROOT), "requested_paths": paths, "accepted_paths": accepted_paths, "rejected_paths": rejected_paths, "rejection_reasons": rejected_paths, "dry_run": dry_run, "changed": changed, "command_preview": ["git", *command_args], "git_result": git_result, "resulting_git_status_preview": status_preview}


@mcp.tool()
def repo_git_diff(root: str = "runtime", relative_path: str | None = None, cached: bool = False, context_lines: int = 3, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Show git diff in runtime."""
    _require_runtime(root)
    args = ["diff", f"--unified={max(0, min(int(context_lines), 20))}"]
    if cached:
        args.append("--cached")
    if relative_path:
        args.extend(["--", _rel("runtime", _resolve_path("runtime", relative_path))])
    return _run_git(args, timeout_s=60, max_chars=max_chars)


@mcp.tool()
def repo_git_recent(root: str = "runtime", limit: int = 20) -> dict[str, Any]:
    """Show recent runtime commits."""
    _require_runtime(root)
    out = _run_git(["log", f"--max-count={max(1, min(int(limit), 200))}", "--date=iso", "--pretty=%H%x09%an%x09%ad%x09%s"], timeout_s=30, max_chars=200_000)
    commits = []
    if out.get("ok"):
        for line in str(out.get("stdout") or "").splitlines():
            parts = line.split("\t", 3)
            if len(parts) == 4:
                commits.append({"hash": parts[0], "author": parts[1], "date": parts[2], "subject": parts[3]})
    return {"ok": bool(out.get("ok")), "root": "runtime", "root_path": str(RUNTIME_ROOT), "count": len(commits), "commits": commits, "raw": out if not out.get("ok") else None}


@mcp.tool()
def repo_git_commit(message: str, root: str = "runtime") -> dict[str, Any]:
    """Commit already-staged runtime changes after a green runtime gate. Does not stage files."""
    _require_runtime(root)
    message_clean = str(message or "").strip()
    if not message_clean:
        return {"ok": False, "error": "empty_commit_message", "commit_hash": "", "stdout": "", "stderr": "Commit message must not be empty.", "final_git_status": _git_status_details()}
    status = _git_status_details()
    if status.get("modified"):
        return {"ok": False, "error": "unstaged_modified_files", "commit_hash": "", "stdout": "", "stderr": "Refusing commit because modified files are not staged.", "unstaged_modified_files": status.get("modified"), "final_git_status": status}
    if status.get("untracked"):
        return {"ok": False, "error": "untracked_files_not_staged", "commit_hash": "", "stdout": "", "stderr": "Refusing commit because untracked files are present and not explicitly staged.", "untracked_files": status.get("untracked"), "final_git_status": status}
    if not status.get("staged"):
        return {"ok": False, "error": "no_staged_changes", "commit_hash": "", "stdout": "", "stderr": "Refusing commit because no files are staged.", "final_git_status": status}
    if not _gate_green():
        return {"ok": False, "error": "last_runtime_gate_not_green", "commit_hash": "", "stdout": "", "stderr": "Refusing commit because the last runtime gate result is not green.", "last_runtime_gate_result": LAST_RUNTIME_GATE_RESULT, "final_git_status": status}
    _require_write_enabled()
    commit = _run_git(["commit", "-m", message_clean], timeout_s=120, max_chars=100_000)
    commit_hash = ""
    if commit.get("ok"):
        rev = _run_git(["rev-parse", "HEAD"], timeout_s=30, max_chars=2_000)
        if rev.get("ok"):
            commit_hash = str(rev.get("stdout") or "").strip()
    return {"ok": bool(commit.get("ok")), "commit_hash": commit_hash, "stdout": commit.get("stdout", ""), "stderr": commit.get("stderr", ""), "final_git_status": _git_status_details()}


@mcp.tool()
def repo_git_push(root: str = "runtime") -> dict[str, Any]:
    """Push the current runtime branch to origin. No force push."""
    _require_runtime(root)
    _require_write_enabled()
    branch = _run_git(["rev-parse", "--abbrev-ref", "HEAD"], timeout_s=30, max_chars=2_000)
    branch_name = str(branch.get("stdout") or "").strip()
    if not branch.get("ok") or not branch_name or branch_name == "HEAD":
        return {"ok": False, "stdout": branch.get("stdout", ""), "stderr": branch.get("stderr", "") or "Refusing push because current branch could not be resolved.", "final_git_status": _git_status_details()}
    push = _run_git(["push", "origin", branch_name], timeout_s=300, max_chars=100_000)
    return {"ok": bool(push.get("ok")), "stdout": push.get("stdout", ""), "stderr": push.get("stderr", ""), "final_git_status": _git_status_details()}


@mcp.tool()
def repo_green_commit_push(message: str, expected_staged_paths: list[str], gate: str = "selector", root: str = "runtime") -> dict[str, Any]:
    """Run a fixed runtime gate, verify explicit staged set, commit, and push. Does not stage files."""
    _require_runtime(root)
    gate_result = run_controlstack_gate(gate=gate, root="runtime")
    if not gate_result.get("ok"):
        return {"ok": False, "stage": "gate", "gate_result": gate_result, "commit": None, "push": None, "final_git_status": _git_status_details()}
    expected = sorted(_normalise_paths(expected_staged_paths))
    status = _git_status_details()
    staged = sorted(status.get("staged") or [])
    if staged != expected:
        return {"ok": False, "stage": "staged_path_guard", "error": "staged_paths_do_not_match_expected", "expected_staged_paths": expected, "actual_staged_paths": staged, "commit": None, "push": None, "final_git_status": status}
    if status.get("modified") or status.get("untracked"):
        return {"ok": False, "stage": "worktree_guard", "error": "unstaged_or_untracked_files_present", "modified": status.get("modified"), "untracked": status.get("untracked"), "commit": None, "push": None, "final_git_status": status}
    commit = repo_git_commit(message=message, root="runtime")
    if not commit.get("ok"):
        return {"ok": False, "stage": "commit", "gate_result": gate_result, "commit": commit, "push": None, "final_git_status": _git_status_details()}
    push = repo_git_push(root="runtime")
    return {"ok": bool(push.get("ok")), "stage": "pushed" if push.get("ok") else "push", "gate_result": gate_result, "commit": commit, "push": push, "final_git_status": _git_status_details()}


@mcp.tool()
def webhook_get(path: str, query: dict[str, Any] | None = None, headers: dict[str, str] | None = None, timeout_s: int = 20, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Send a GET request to the local ControlStack webhook server."""
    if not path.startswith("/") or _path_has_control_chars(path):
        raise ValueError("path must start with / and contain no control characters")
    url = WEBHOOK_BASE_URL + path
    if query:
        url += "?" + urllib.parse.urlencode(query, doseq=True)
    req = urllib.request.Request(url, headers=headers or {}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as response:
            text = response.read().decode("utf-8", errors="replace")
            body, truncated = _clip_text(text, max_chars)
            return {"ok": 200 <= response.status < 400, "status": response.status, "url": url, "body": body, "truncated": truncated}
    except urllib.error.HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        body, truncated = _clip_text(text, max_chars)
        return {"ok": False, "status": exc.code, "url": url, "body": body, "truncated": truncated}


@mcp.tool()
def webhook_post(path: str, json_body: dict[str, Any] | list[Any] | None = None, text_body: str | None = None, headers: dict[str, str] | None = None, timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Send a POST request to the local ControlStack webhook server."""
    if not path.startswith("/") or _path_has_control_chars(path):
        raise ValueError("path must start with / and contain no control characters")
    if json_body is not None and text_body is not None:
        raise ValueError("Provide json_body or text_body, not both")
    url = WEBHOOK_BASE_URL + path
    request_headers = dict(headers or {})
    if json_body is not None:
        data = json.dumps(json_body).encode("utf-8")
        request_headers.setdefault("Content-Type", "application/json")
    else:
        data = (text_body or "").encode("utf-8")
        request_headers.setdefault("Content-Type", "text/plain; charset=utf-8")
    req = urllib.request.Request(url, data=data, headers=request_headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as response:
            text = response.read().decode("utf-8", errors="replace")
            body, truncated = _clip_text(text, max_chars)
            return {"ok": 200 <= response.status < 400, "status": response.status, "url": url, "body": body, "truncated": truncated}
    except urllib.error.HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        body, truncated = _clip_text(text, max_chars)
        return {"ok": False, "status": exc.code, "url": url, "body": body, "truncated": truncated}


def _run_server() -> None:
    logger.info("Starting runtime-owned ControlStack MCP server: runtime=%s donor_reference=%s transport=%s", RUNTIME_ROOT, DONOR_REFERENCE_ROOT, ACTIVE_TRANSPORT)
    if ACTIVE_TRANSPORT in {"http", "streamable-http", "streamable_http"}:
        mcp.run(transport="streamable-http")
    else:
        mcp.run()


if __name__ == "__main__":
    _run_server()
