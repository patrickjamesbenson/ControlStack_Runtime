#!/usr/bin/env python3
"""Fixed Governance & Shell lane gate.

The gate discovers only reviewed governance/shell test families inside the configured
worktree. It accepts no arbitrary command and refuses a wrong root or branch.
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

GATE_NAME = "governance-shell"
REQUIRED_BRANCH = "lane/governance-shell"
SCRIPT_ROOT = Path(__file__).resolve().parents[1]
TEST_PATTERNS = (
    "tests/governance*.test.js",
    "tests/runtimeGovernance*.test.js",
    "tests/runtimeShell*.test.js",
    "tests/runtimeProjectBrowser*.test.js",
)
EXCLUDED_SELECTOR_ENGINE_TESTS = {
    "tests/runtimeShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount.test.js",
    "tests/runtimeShellProjectBrowserSelectedProjectEngineReadonlyInvokeMountContractLock.test.js",
    "tests/runtimeShellRestoredCsSelectorEngineActionLaneRerenderSurvival.test.js",
}
DEFAULT_MAX_CHARS = 50_000


def _safe_env() -> dict[str, str]:
    allowed = {
        "APPDATA", "COMSPEC", "HOME", "LOCALAPPDATA", "PATH", "PATHEXT",
        "PROGRAMFILES", "PROGRAMFILES(X86)", "PROGRAMW6432", "SYSTEMDRIVE",
        "SYSTEMROOT", "TEMP", "TMP", "USERPROFILE", "WINDIR",
    }
    env = {key: value for key, value in os.environ.items() if key.upper() in allowed}
    env.update({
        "CI": "1",
        "NO_COLOR": "1",
        "NPM_CONFIG_COLOR": "false",
        "NPM_CONFIG_UPDATE_NOTIFIER": "false",
        "PYTHONDONTWRITEBYTECODE": "1",
    })
    return env


def _clip(text: str, maximum: int) -> tuple[str, bool]:
    if len(text) <= maximum:
        return text, False
    return text[:maximum], True


def _payload(
    *,
    ok: bool,
    root: Path,
    branch: str,
    command: list[str],
    exit_code: int,
    stdout: str,
    stderr: str,
    duration_s: float,
    truncated: bool,
    error: str | None = None,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "ok": ok,
        "gate": GATE_NAME,
        "root": str(root),
        "required_branch": REQUIRED_BRANCH,
        "branch": branch,
        "commands": [command] if command else [],
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


def _git_branch(root: Path) -> str:
    result = subprocess.run(
        ["git.exe", "-C", str(root), "branch", "--show-current"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
        shell=False,
        env=_safe_env(),
    )
    if result.returncode != 0:
        raise RuntimeError("Unable to verify the Governance lane branch.")
    return result.stdout.strip()


def _tests(root: Path) -> list[str]:
    files: set[Path] = set()
    for pattern in TEST_PATTERNS:
        files.update(root.glob(pattern))
    resolved = sorted(
        relative
        for path in files
        if path.is_file()
        for relative in [path.relative_to(root).as_posix()]
        if relative not in EXCLUDED_SELECTOR_ENGINE_TESTS
    )
    if not resolved:
        raise RuntimeError("No reviewed Governance & Shell tests were found.")
    return resolved


def run(root: Path, maximum: int) -> dict[str, Any]:
    started = time.monotonic()
    try:
        resolved_root = root.resolve(strict=True)
        if resolved_root != SCRIPT_ROOT.resolve(strict=True):
            raise RuntimeError("The gate root does not match the Governance & Shell worktree.")
        branch = _git_branch(resolved_root)
        if branch != REQUIRED_BRANCH:
            raise RuntimeError("The Governance & Shell branch guard failed.")
        command = ["node", "--test", *_tests(resolved_root)]
        process = subprocess.run(
            command,
            cwd=str(resolved_root),
            env=_safe_env(),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=1800,
            shell=False,
        )
        budget = max(2_000, min(24_000, (maximum - 2_000) // 2))
        stdout, stdout_cut = _clip(process.stdout or "", budget)
        stderr, stderr_cut = _clip(process.stderr or "", budget)
        return _payload(
            ok=process.returncode == 0,
            root=resolved_root,
            branch=branch,
            command=command,
            exit_code=process.returncode,
            stdout=stdout,
            stderr=stderr,
            duration_s=time.monotonic() - started,
            truncated=stdout_cut or stderr_cut,
        )
    except subprocess.TimeoutExpired as exc:
        stdout, stdout_cut = _clip(exc.stdout or "", 20_000)
        stderr, stderr_cut = _clip(exc.stderr or "", 20_000)
        return _payload(
            ok=False,
            root=root,
            branch="",
            command=[],
            exit_code=124,
            stdout=stdout,
            stderr=stderr,
            duration_s=time.monotonic() - started,
            truncated=stdout_cut or stderr_cut,
            error="timeout",
        )
    except Exception as exc:  # bounded gate diagnostics only
        return _payload(
            ok=False,
            root=root,
            branch="",
            command=[],
            exit_code=2,
            stdout="",
            stderr=str(exc),
            duration_s=time.monotonic() - started,
            truncated=False,
            error="gate_preflight_failed",
        )


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Run the fixed Governance & Shell lane gate.")
    parser.add_argument("gate")
    parser.add_argument("--root", required=True)
    parser.add_argument("--required-branch", default=REQUIRED_BRANCH)
    parser.add_argument("--changed", nargs="*", default=[])
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    args = parser.parse_args(argv)

    if args.gate != GATE_NAME or args.required_branch != REQUIRED_BRANCH:
        result = _payload(
            ok=False,
            root=Path(args.root),
            branch="",
            command=[],
            exit_code=2,
            stdout="",
            stderr="Unknown or disallowed Governance & Shell gate.",
            duration_s=0.0,
            truncated=False,
            error="disallowed_gate",
        )
    else:
        result = run(Path(args.root), max(1_000, args.max_chars))

    if args.json:
        print(json.dumps(result, ensure_ascii=True))
    else:
        print(result["stdout"], end="")
        if result["stderr"]:
            print(result["stderr"], file=sys.stderr, end="")
    return int(result["exit_code"] or 0)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
