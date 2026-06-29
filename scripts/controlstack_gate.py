#!/usr/bin/env python3
"""Fixed named runtime gate runner for ControlStack Runtime.

This script intentionally supports named gates only. It does not accept arbitrary
shell commands or user-supplied working directories.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ALLOWED_GATES = {"selector", "test", "runtime"}
ROOT = Path(__file__).resolve().parents[1]
COMMAND = ["npm.cmd", "test"]


def emit(result):
    print(json.dumps(result))


def main():
    parser = argparse.ArgumentParser(description="ControlStack Runtime fixed gate runner")
    parser.add_argument("gate")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--max-chars", type=int, default=50000)
    args = parser.parse_args()

    gate = str(args.gate or "").strip().lower()
    if gate not in ALLOWED_GATES:
        emit({
            "ok": False,
            "gate": gate,
            "root": str(ROOT),
            "command": [],
            "exit_code": 2,
            "returncode": 2,
            "stdout": "",
            "stderr": f"Unsupported gate: {gate}",
            "duration_s": 0,
            "truncated": False,
        })
        return 2

    start = time.perf_counter()
    completed = subprocess.run(
        COMMAND,
        cwd=str(ROOT),
        shell=False,
        text=True,
        capture_output=True,
    )
    duration_s = round(time.perf_counter() - start, 3)
    stdout = completed.stdout or ""
    stderr = completed.stderr or ""
    max_chars = max(1000, int(args.max_chars or 50000))
    truncated = (len(stdout) + len(stderr)) > max_chars
    if truncated:
        stdout_budget = max_chars // 2
        stderr_budget = max_chars - stdout_budget
        stdout = stdout[:stdout_budget]
        stderr = stderr[:stderr_budget]

    emit({
        "ok": completed.returncode == 0,
        "gate": gate,
        "root": str(ROOT),
        "command": COMMAND,
        "exit_code": completed.returncode,
        "returncode": completed.returncode,
        "stdout": stdout,
        "stderr": stderr,
        "duration_s": duration_s,
        "truncated": truncated,
    })
    return completed.returncode


if __name__ == "__main__":
    sys.exit(main())
