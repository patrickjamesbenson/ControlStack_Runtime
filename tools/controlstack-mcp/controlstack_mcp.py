from __future__ import annotations

r"""Runtime-owned ControlStack MCP server.

This MCP is intentionally scoped to fixed, named ControlStack runtime work tools.
It does not expose arbitrary terminal execution, user-supplied command strings,
or broad shell access.

Roots:
- runtime: C:\ControlStack_Runtime
- donor / donor_reference: optional read-only reference at C:\ControlStack

Donor-reference tools are allowed to fail if the donor repo no longer exists.
Runtime tools must not depend on the donor repo.
"""

import fnmatch
import json
import logging
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from mcp.server.fastmcp import FastMCP

DEFAULT_RUNTIME_ROOT = r"C:\ControlStack_Runtime"
DEFAULT_DONOR_REFERENCE_ROOT = r"C:\ControlStack"
DEFAULT_MAX_CHARS = 50_000
DEFAULT_MAX_DIR_ENTRIES = 200
DEFAULT_HTTP_PATH = "/mcp"
MAX_TEXT_BYTES = 5 * 1024 * 1024

ACTIVE_TRANSPORT = os.environ.get("CONTROLSTACK_MCP_TRANSPORT", "stdio").strip().lower()
RUNTIME_ROOT = Path(os.environ.get("CONTROLSTACK_RUNTIME_ROOT", DEFAULT_RUNTIME_ROOT)).resolve()
DONOR_REFERENCE_ROOT = Path(os.environ.get("CONTROLSTACK_DONOR_REFERENCE_ROOT", DEFAULT_DONOR_REFERENCE_ROOT)).resolve()

HTTP_HOST = os.environ.get("CONTROLSTACK_MCP_HOST", "127.0.0.1")
HTTP_PORT = int(os.environ.get("CONTROLSTACK_MCP_PORT", "8000"))
HTTP_PATH = os.environ.get("CONTROLSTACK_MCP_PATH", DEFAULT_HTTP_PATH)

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,
    format="[%(asctime)s] %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("runtime_controlstack_mcp")

mcp = FastMCP(
    "ControlStack Runtime",
    instructions=(
        "Use these tools for the configured local ControlStack Runtime root only. "
        "Donor-reference tools are read-only and optional. Never request or write "
        "paths outside the selected root. Do not use arbitrary terminal execution."
    ),
    stateless_http=True,
    json_response=True,
    host=HTTP_HOST,
    port=HTTP_PORT,
    streamable_http_path=HTTP_PATH,
)

EXCLUDED_DIRS = {
    ".git",
    ".venv",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "dist",
    "build",
}
EXCLUDED_GLOBS = {"*.pyc", "*.pyo", "*.bak", "*.bak_*", "*.log"}
GIT_INDEX_JUNK_DIRS = {"node_modules", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"}
GIT_INDEX_ARCHIVE_EXTS = {".zip", ".tar", ".tgz", ".rar", ".7z", ".gz", ".bz2", ".xz"}
GIT_INDEX_GLOB_CHARS = {"*", "?", "[", "]"}
ALLOWED_GATES = {"selector", "test", "runtime"}
FIXED_GATE_COMMAND = ["npm.cmd", "test"]

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
    raise ValueError("root must be 'runtime' or read-only 'donor'")


def _root_path(root: str = "runtime") -> Path:
    label = _root_label(root)
    return RUNTIME_ROOT if label == "runtime" else DONOR_REFERENCE_ROOT


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
    label = _root_label(root)
    if label != "runtime":
        raise PermissionError("This tool is runtime-only. Donor reference is read-only.")
    _require_root_exists("runtime")


def _require_write_enabled() -> None:
    if not ENABLE_WRITE:
        raise PermissionError("Write tools are disabled. Set CONTROLSTACK_ENABLE_WRITE=1 to enable them.")


def _resolve_path(root: str = "runtime", relative_path: str = ".") -> Path:
    label = _root_label(root)
    base = _root_path(label)
    raw = relative_path or "."
    raw_path = Path(raw)
    candidate = raw_path.resolve() if raw_path.is_absolute() else (base / raw).resolve()
    try:
        candidate.relative_to(base)
    except ValueError as exc:
        raise ValueError(f"Path escapes selected root {label!r}: {relative_path!r}") from exc
    return candidate


def _rel(root: str, path: Path) -> str:
    label = _root_label(root)
    return str(path.resolve().relative_to(_root_path(label))).replace("\\", "/")


def _clip_text(text: str, max_chars: int) -> tuple[str, bool]:
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


def _iter_files(
    root: str,
    relative_path: str = ".",
    include_globs: list[str] | None = None,
    exclude_globs: list[str] | None = None,
    max_files: int = 50_000,
):
    label = _root_label(root)
    _require_root_exists(label)
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
        if include_globs and not any(
            fnmatch.fnmatch(path.name, glob) or fnmatch.fnmatch(rel, glob)
            for glob in include_globs
        ):
            continue
        yielded += 1
        yield path


def _safe_env_for_child() -> dict[str, str]:
    allowed_keys = {
        "APPDATA",
        "COMSPEC",
        "HOME",
        "LOCALAPPDATA",
        "PATH",
        "PATHEXT",
        "PROGRAMFILES",
        "PROGRAMFILES(X86)",
        "PROGRAMW6432",
        "SYSTEMDRIVE",
        "SYSTEMROOT",
        "TEMP",
        "TMP",
        "USERPROFILE",
        "WINDIR",
    }
    env = {key: value for key, value in os.environ.items() if key.upper() in allowed_keys}
    env["CI"] = "1"
    env["NO_COLOR"] = "1"
    env["NPM_CONFIG_COLOR"] = "false"
    env["NPM_CONFIG_UPDATE_NOTIFIER"] = "false"
    return env


def _run_git(args: list[str], timeout_s: int = 30, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    _require_runtime("runtime")
    started = time.monotonic()
    cmd = ["git", *args]
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(RUNTIME_ROOT),
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


def _path_has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 or ord(ch) == 127 for ch in value)


def _path_has_glob_chars(value: str) -> bool:
    return any(ch in value for ch in GIT_INDEX_GLOB_CHARS)


def _path_has_parent_traversal(value: str) -> bool:
    return any(part == ".." for part in re.split(r"[\\/]+", value))


def _lexically_confined_runtime_path(path_value: str) -> Path:
    raw_path = Path(path_value)
    candidate = raw_path if raw_path.is_absolute() else RUNTIME_ROOT / path_value
    candidate = Path(os.path.abspath(candidate))
    try:
        candidate.relative_to(RUNTIME_ROOT)
    except ValueError as exc:
        raise ValueError(f"Path escapes runtime root: {path_value!r}") from exc
    return candidate


def _git_index_junk_reason(relative_path: str) -> str | None:
    relp = relative_path.replace("\\", "/")
    name = relp.rsplit("/", 1)[-1]
    parts = set(relp.split("/"))
    for junk_dir in sorted(GIT_INDEX_JUNK_DIRS):
        if junk_dir in parts:
            return f"junk/cache directory rejected by default: {junk_dir}"
    if relp.startswith("dist/assets/") or "/dist/assets/" in relp:
        return "dist/assets output requires allow_junk=true after explicit review"
    if name.endswith(".bak"):
        return "backup artifact rejected by default: *.bak"
    if ".bak_safe_patch_" in name:
        return "safe-patch backup artifact rejected by default: *.bak_safe_patch_*"
    if ".BACKUP_" in name:
        return "backup artifact rejected by default: *.BACKUP_*"
    lower = name.lower()
    for ext in sorted(GIT_INDEX_ARCHIVE_EXTS, key=len, reverse=True):
        if lower.endswith(ext):
            return f"archive output rejected by default: *{ext}"
    return None


def _prepare_git_index_paths(
    paths: list[str],
    *,
    require_existing_files: bool,
    allow_missing: bool,
    allow_junk: bool,
) -> tuple[list[str], list[dict[str, Any]]]:
    if not isinstance(paths, list) or not paths:
        raise ValueError("paths[] is required and must contain at least one explicit path")
    accepted: list[str] = []
    rejected: list[dict[str, Any]] = []
    for raw in paths:
        requested = str(raw)
        reason = None
        resolved: Path | None = None
        if not isinstance(raw, str):
            reason = "path must be a string"
        elif requested == "":
            reason = "empty paths are not allowed"
        elif _path_has_control_chars(requested):
            reason = "NUL, newline, or control characters are not allowed in paths"
        elif _path_has_glob_chars(requested):
            reason = "wildcards/globs are not allowed; provide explicit file paths"
        elif _path_has_parent_traversal(requested):
            reason = "path traversal segments such as ../ are not allowed"
        else:
            try:
                lexical = _lexically_confined_runtime_path(requested)
                resolved = _resolve_path("runtime", requested) if lexical.exists() else lexical
            except ValueError as exc:
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
            relp = _rel("runtime", resolved)
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
    return bool(
        LAST_RUNTIME_GATE_RESULT
        and LAST_RUNTIME_GATE_RESULT.get("ok") is True
        and LAST_RUNTIME_GATE_RESULT.get("returncode") == 0
    )


@mcp.tool()
def repo_info() -> dict[str, Any]:
    """Return configured runtime and optional donor-reference roots."""
    return {
        "runtime_root": str(RUNTIME_ROOT),
        "runtime_exists": RUNTIME_ROOT.exists(),
        "donor_reference_root": str(DONOR_REFERENCE_ROOT),
        "donor_reference_exists": DONOR_REFERENCE_ROOT.exists(),
        "transport": ACTIVE_TRANSPORT,
        "http_host": HTTP_HOST,
        "http_port": HTTP_PORT,
        "http_path": HTTP_PATH,
        "write_enabled": ENABLE_WRITE,
        "arbitrary_shell_execution": False,
        "allowed_roots": ["runtime", "donor"],
        "runtime_gate_command": FIXED_GATE_COMMAND,
    }


@mcp.tool()
def list_repo_directory(relative_path: str = ".", recursive: bool = False, max_entries: int = DEFAULT_MAX_DIR_ENTRIES, root: str = "runtime") -> dict[str, Any]:
    """List files and folders inside the runtime root or optional donor reference root."""
    if max_entries < 1:
        raise ValueError("max_entries must be >= 1")
    label = _root_label(root)
    _require_root_exists(label)
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
    """Read a UTF-8 text file from the runtime root or optional donor reference root."""
    if start_line < 1:
        raise ValueError("start_line must be >= 1")
    if end_line is not None and end_line < start_line:
        raise ValueError("end_line must be >= start_line")
    label = _root_label(root)
    _require_root_exists(label)
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
    """Write a UTF-8 file inside the runtime root only."""
    _require_runtime(root)
    _require_write_enabled()
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
    return {"root": "runtime", "root_path": str(RUNTIME_ROOT), "relative_path": _rel("runtime", target), "absolute_path": str(target), "changed": True, "created": not existed, "overwritten": existed, "bytes_before": before, "bytes_written": target.stat().st_size, "newline": "\\n"}


@mcp.tool()
def delete_runtime_file(relative_path: str, dry_run: bool = True) -> dict[str, Any]:
    """Delete one explicit file inside the runtime root. Directories and path traversal are refused."""
    _require_runtime("runtime")
    target = _resolve_path("runtime", relative_path)
    if not target.exists() or not target.is_file():
        raise FileNotFoundError(f"File not found: {relative_path}")
    payload = {"ok": True, "root": "runtime", "root_path": str(RUNTIME_ROOT), "relative_path": _rel("runtime", target), "dry_run": dry_run, "changed": not dry_run, "bytes_deleted": target.stat().st_size}
    if dry_run:
        return payload
    _require_write_enabled()
    target.unlink()
    return payload


@mcp.tool()
def repo_find_files(root: str = "runtime", pattern: str = "*", mode: str = "glob", max_results: int = 200, relative_path: str = ".") -> dict[str, Any]:
    """Find files by glob, substring, or regex in the runtime or donor-reference root."""
    label = _root_label(root)
    if mode not in {"glob", "substring", "regex"}:
        raise ValueError("mode must be glob, substring, or regex")
    rx = re.compile(pattern) if mode == "regex" else None
    entries: list[dict[str, Any]] = []
    for path in _iter_files(label, relative_path, None, None):
        if len(entries) >= max_results:
            break
        relp = _rel(label, path)
        matched = fnmatch.fnmatch(relp, pattern) or fnmatch.fnmatch(path.name, pattern) if mode == "glob" else (pattern.lower() in relp.lower() if mode == "substring" else bool(rx and rx.search(relp)))
        if matched:
            stat = path.stat()
            entries.append({"relative_path": relp, "name": path.name, "size_bytes": stat.st_size, "modified_utc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()})
    return {"ok": True, "root": label, "root_path": str(_root_path(label)), "pattern": pattern, "mode": mode, "count": len(entries), "truncated": len(entries) >= max_results, "entries": entries}


@mcp.tool()
def repo_grep(root: str = "runtime", query: str = "", case_sensitive: bool = False, regex: bool = False, include_globs: list[str] | None = None, exclude_globs: list[str] | None = None, max_results: int = 100, context_lines: int = 2, relative_path: str = ".") -> dict[str, Any]:
    """Text search across runtime or donor-reference files."""
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
def run_controlstack_gate(gate: str, root: str = "runtime", timeout_s: int = 1800, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Run a fixed named runtime gate. Allowed gates: selector, test, runtime."""
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
        if stderr and not result.get("stderr"):
            result["stderr"] = stderr
    else:
        result = {"ok": proc.returncode == 0, "gate": gate_name, "root": str(RUNTIME_ROOT), "command": FIXED_GATE_COMMAND, "exit_code": proc.returncode, "returncode": proc.returncode, "stdout": stdout, "stderr": stderr, "duration_s": round(time.monotonic() - started, 3), "truncated": stdout_truncated or stderr_truncated}

    LAST_RUNTIME_GATE_RESULT = result
    return result


@mcp.tool()
def repo_git_status(root: str = "runtime") -> dict[str, Any]:
    """Show git status for the runtime repo."""
    _require_runtime(root)
    return _git_status_details()


@mcp.tool()
def repo_git_stage(paths: list[str], root: str = "runtime", dry_run: bool = True, allow_junk: bool = False) -> dict[str, Any]:
    """Safely stage explicit runtime file paths. No globs, directories, or backup artifacts by default."""
    _require_runtime(root)
    accepted_paths, rejected_paths = _prepare_git_index_paths(paths, require_existing_files=True, allow_missing=False, allow_junk=allow_junk)
    command_args = ["add", "--", *accepted_paths]
    command_preview = ["git", *command_args]
    git_result = None
    changed = False
    if accepted_paths and not dry_run:
        _require_write_enabled()
        git_result = _run_git(command_args, timeout_s=30, max_chars=50_000)
        changed = bool(git_result.get("ok"))
    status_preview = _run_git(["status", "--porcelain=v1", "-b", "--", *accepted_paths], max_chars=50_000)
    return {"ok": bool(accepted_paths) and (git_result is None or bool(git_result.get("ok"))), "root": "runtime", "root_path": str(RUNTIME_ROOT), "requested_paths": paths, "accepted_paths": accepted_paths, "rejected_paths": rejected_paths, "rejection_reasons": rejected_paths, "dry_run": dry_run, "allow_junk": allow_junk, "changed": changed, "command_preview": command_preview, "git_result": git_result, "resulting_git_status_preview": status_preview}


@mcp.tool()
def repo_git_diff(root: str = "runtime", relative_path: str | None = None, cached: bool = False, context_lines: int = 3, max_chars: int = DEFAULT_MAX_CHARS) -> dict[str, Any]:
    """Show runtime git diff."""
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
    branch = _run_git(["rev-parse", "--abbrev-ref", "HEAD"], timeout_s=30, max_chars=2_000)
    branch_name = str(branch.get("stdout") or "").strip()
    if not branch.get("ok") or not branch_name or branch_name == "HEAD":
        return {"ok": False, "stdout": branch.get("stdout", ""), "stderr": branch.get("stderr", "") or "Refusing push because current branch could not be resolved.", "final_git_status": _git_status_details()}
    push = _run_git(["push", "origin", branch_name], timeout_s=300, max_chars=100_000)
    return {"ok": bool(push.get("ok")), "stdout": push.get("stdout", ""), "stderr": push.get("stderr", ""), "final_git_status": _git_status_details()}


@mcp.tool()
def repo_green_commit_push(message: str, expected_staged_paths: list[str], gate: str = "selector", root: str = "runtime") -> dict[str, Any]:
    """Run a fixed runtime gate, verify the explicit staged set, commit, and push. Does not stage files."""
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


def _run_server() -> None:
    logger.info(
        "Starting runtime-owned ControlStack MCP server: runtime=%s donor_reference=%s transport=%s",
        RUNTIME_ROOT,
        DONOR_REFERENCE_ROOT,
        ACTIVE_TRANSPORT,
    )
    if ACTIVE_TRANSPORT in {"http", "streamable-http", "streamable_http"}:
        mcp.run(transport="streamable-http")
    else:
        mcp.run()


if __name__ == "__main__":
    _run_server()
