#!/usr/bin/env python3
"""Bounded, named quality gates for isolated ControlStack lanes."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

DEFAULT_MAX_CHARS = 50_000

FIXED_TESTS: dict[str, list[str]] = {
    "selector-engine": [
        "tests/selectorReferenceOptionsService.test.js",
        "tests/selectorLightControlSpine.test.js",
        "tests/selectorCascadeCorrectness.test.js",
        "tests/engineRunTableDomain.test.js",
        "tests/engineFlowViewModel.test.js",
    ],
    "program-integrate": [
        "tests/runtimeServedSurfaceHardening.test.js",
        "tests/runtimeDataReadOnlySourceAccessService.test.js",
        "tests/engineRunTableDomain.test.js",
    ],
}


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


def _git_branch(root: Path) -> str:
    proc = subprocess.run(
        ["git", "-C", str(root), "branch", "--show-current"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
        shell=False,
        env=_safe_env(),
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or "Git branch lookup failed.")
    return proc.stdout.strip()


def _commands(gate: str, root: Path) -> list[list[str]]:
    if gate in FIXED_TESTS:
        missing = [path for path in FIXED_TESTS[gate] if not (root / path).is_file()]
        if missing:
            raise FileNotFoundError(f"Required bounded test files are missing: {', '.join(missing)}")
        return [["node", "--test", *FIXED_TESTS[gate]]]

    if gate == "lab-ies":
        tests = sorted(
            path.relative_to(root).as_posix()
            for path in (root / "tests" / "lab-kernel").glob("*.test.js")
            if path.is_file()
        )
        if not tests:
            raise FileNotFoundError("No Lab/IES tests were found under tests/lab-kernel.")
        if len(tests) > 100:
            raise RuntimeError(f"Lab/IES gate exceeded its 100-file bound: {len(tests)}")
        return [["node", "--test", *tests]]

    if gate == "tooling-policy":
        policy_test = root / "tests" / "controlstack_mcp_lane_policy_test.py"
        mcp_source = root / "tools" / "controlstack-mcp" / "controlstack_mcp.py"
        if not policy_test.is_file() or not mcp_source.is_file():
            raise FileNotFoundError("Tooling policy test or MCP source is missing.")
        syntax_check = (
            "import ast,pathlib,sys;"
            "[ast.parse(pathlib.Path(p).read_text(encoding=\'utf-8\')) for p in sys.argv[1:]];"
            "print(\'Python syntax: PASS\')"
        )
        return [
            [sys.executable, "-c", syntax_check, str(mcp_source), str(Path(__file__).resolve())],
            [sys.executable, str(policy_test)],
        ]

    raise ValueError(f"Unknown or disallowed lane gate: {gate!r}")


def _clip(text: str, limit: int) -> tuple[str, bool]:
    if len(text) <= limit:
        return text, False
    return text[:limit], True


def run(gate: str, root: Path, required_branch: str, max_chars: int) -> dict[str, Any]:
    started = time.monotonic()
    root = root.resolve()
    result: dict[str, Any] = {
        "ok": False,
        "gate": gate,
        "root": str(root),
        "required_branch": required_branch,
        "branch": "",
        "commands": [],
        "exit_code": 2,
        "returncode": 2,
        "stdout": "",
        "stderr": "",
        "duration_s": 0.0,
        "truncated": False,
    }
    try:
        if not root.is_dir():
            raise FileNotFoundError(f"Lane root does not exist: {root}")
        branch = _git_branch(root)
        result["branch"] = branch
        if not branch.startswith("lane/"):
            raise PermissionError(f"Gate requires a lane/* branch; found {branch!r}.")
        if required_branch and branch != required_branch:
            raise PermissionError(f"Gate requires branch {required_branch!r}; found {branch!r}.")

        commands = _commands(gate, root)
        result["commands"] = commands
        stdout_parts: list[str] = []
        stderr_parts: list[str] = []
        for index, command in enumerate(commands, 1):
            proc = subprocess.run(
                command,
                cwd=str(root),
                env=_safe_env(),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=900,
                shell=False,
            )
            stdout_parts.append(f"=== command {index} ===\n{proc.stdout or ''}")
            if proc.stderr:
                stderr_parts.append(f"=== command {index} ===\n{proc.stderr}")
            if proc.returncode != 0:
                result["exit_code"] = proc.returncode
                result["returncode"] = proc.returncode
                break
        else:
            result["ok"] = True
            result["exit_code"] = 0
            result["returncode"] = 0

        stdout, stdout_cut = _clip("\n".join(stdout_parts), max_chars)
        stderr, stderr_cut = _clip("\n".join(stderr_parts), max_chars)
        result["stdout"] = stdout
        result["stderr"] = stderr
        result["truncated"] = stdout_cut or stderr_cut
    except subprocess.TimeoutExpired as exc:
        result.update({
            "exit_code": 124,
            "returncode": 124,
            "stderr": f"Bounded lane gate timed out: {exc}",
            "error": "timeout",
        })
    except Exception as exc:
        result.update({
            "exit_code": 2,
            "returncode": 2,
            "stderr": str(exc),
            "error": exc.__class__.__name__,
        })
    result["duration_s"] = round(time.monotonic() - started, 3)
    return result


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Run one fixed ControlStack lane gate.")
    parser.add_argument("gate", choices=["selector-engine", "lab-ies", "program-integrate", "tooling-policy"])
    parser.add_argument("--root", required=True)
    parser.add_argument("--required-branch", required=True)
    parser.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    result = run(args.gate, Path(args.root), args.required_branch, max(2_000, args.max_chars))
    if args.json:
        print(json.dumps(result, ensure_ascii=True))
    else:
        if result["stdout"]:
            print(result["stdout"])
        if result["stderr"]:
            print(result["stderr"], file=sys.stderr)
    return int(result["exit_code"])


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
