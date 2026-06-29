#!/usr/bin/env python3
"""Fixed named runtime gate runner for ControlStack Runtime.

This script intentionally supports named gates only. It does not accept arbitrary
shell commands or user-supplied working directories. The supported gates are
diagnostic aliases only; every allowed gate runs the same fixed runtime test
command from the runtime root.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

ALLOWED_GATES = {"selector", "test", "runtime"}
RUNTIME_ROOT = Path(__file__).resolve().parents[1]
FIXED_COMMAND = ["npm.cmd", "test"]
DEFAULT_MAX_CHARS = 50_000


def _clip_text(text: str, max_chars: int) -> tuple[str, bool]:
    if max_chars <= 0 or len(text) <= max_chars:
        return text, False
    return text[:max_chars], True


def _safe_env() -> dict[str, str]:
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


def _payload(
    *,
    ok: bool,
    gate: str,
    exit_code: int | None,
    stdout: str,
    stderr: str,
    duration_s: float,
    truncated: bool,
    error: str | None = None,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "ok": ok,
        "gate": gate,
        "root": str(RUNTIME_ROOT),
        "command": FIXED_COMMAND,
        "exit_code": exit_code,
        "returncode": exit_code,
        "stdout": stdout,
        "stderr": stderr,
        "duration_s": round(duration_s, 3),
        "truncated": truncated,
    }
    if error:
        result["error"] = error
    return result


def run_gate(gate: str, max_chars: int) -> dict[str, Any]:
    gate_name = str(gate or "").strip().lower()
    if gate_name not in ALLOWED_GATES:
        return _payload(
            ok=False,
            gate=gate_name,
            exit_code=2,
            stdout="",
            stderr=f"Unknown or disallowed ControlStack runtime gate: {gate!r}",
            duration_s=0.0,
            truncated=False,
            error="disallowed_gate",
        )

    stream_budget = max(2_000, min(20_000, (max_chars - 2_000) // 2))
    started = time.monotonic()
    try:
        proc = subprocess.run(
            FIXED_COMMAND,
            cwd=str(RUNTIME_ROOT),
            env=_safe_env(),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=1800,
            shell=False,
        )
    except FileNotFoundError as exc:
        return _payload(
            ok=False,
            gate=gate_name,
            exit_code=127,
            stdout="",
            stderr=str(exc),
            duration_s=time.monotonic() - started,
            truncated=False,
            error="npm_not_found",
        )
    except subprocess.TimeoutExpired as exc:
        stdout, stdout_truncated = _clip_text(exc.stdout or "", stream_budget)
        stderr, stderr_truncated = _clip_text(exc.stderr or "", stream_budget)
        return _payload(
            ok=False,
            gate=gate_name,
            exit_code=124,
            stdout=stdout,
            stderr=stderr,
            duration_s=time.monotonic() - started,
            truncated=stdout_truncated or stderr_truncated,
            error="timeout",
        )

    stdout, stdout_truncated = _clip_text(proc.stdout or "", stream_budget)
    stderr, stderr_truncated = _clip_text(proc.stderr or "", stream_budget)
    return _payload(
        ok=proc.returncode == 0,
        gate=gate_name,
        exit_code=proc.returncode,
        stdout=stdout,
        stderr=stderr,
        duration_s=time.monotonic() - started,
        truncated=stdout_truncated or stderr_truncated,
    )


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Run fixed ControlStack Runtime quality gates.")
    parser.add_argument("gate", choices=sorted(ALLOWED_GATES))
    parser.add_argument("--json", action="store_true", help="Emit a JSON result.")
    parser.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    parser.add_argument(
        "--changed",
        nargs="*",
        default=[],
        help="Accepted for MCP compatibility; ignored by fixed runtime gates.",
    )
    args = parser.parse_args(argv)

    result = run_gate(args.gate, max(1_000, args.max_chars))
    if args.json:
        print(json.dumps(result, ensure_ascii=True))
    else:
        print(result["stdout"], end="")
        if result["stderr"]:
            print(result["stderr"], file=sys.stderr, end="")
    return int(result["exit_code"] or 0)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
