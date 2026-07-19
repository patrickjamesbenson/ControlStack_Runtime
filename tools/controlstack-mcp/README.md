# Program-local ControlStack MCP contract snapshot

Status: NON-AUTHORITATIVE PROGRAM TEST FIXTURE  
Owner: Program & Integrate for local contract tests only

## Canonical authority

The deployed and editable ControlStack MCP source is owned by the shared-tooling lane:

- root: `C:\ControlStack_Worktrees\controlstack-tooling-v2`;
- branch: `lane/controlstack-tooling-v2`;
- source: `tools/controlstack-mcp/controlstack_mcp.py`;
- last confirmed guard repair: `2e4d880`.

## Program-local files

- `controlstack_mcp_program_contract_snapshot.py` is the preserved Program-only fixture used by tests and evidence probes that inspect or execute the historical MCP seam contract.
- `controlstack_mcp.py` is a fail-closed tombstone. It exits immediately and must never be patched, imported, started, or deployed as an MCP server.

The explicit filename split prevents a Program-local fixture from being mistaken for the deployed shared-tooling source. Local legacy launchers that still address `controlstack_mcp.py` intentionally stop at the tombstone rather than starting stale MCP code.

## Maintenance rule

A tooling defect must be repaired, tested, committed and pushed through the connected shared-tooling app. The Program snapshot may be refreshed only through an explicit source-hash-evidenced sync parcel that compares the complete canonical source, records the canonical tooling commit, updates dependent Program tests where necessary, and passes the full `program-integrate` gate.

Do not infer that a successful Program commit updates the deployed MCP service.

## Guard repair record

Shared-tooling commit `2e4d880` changed the canonical commit path so `repo_green_commit_push` accepts unrelated unstaged and untracked work only after the actual staged set exactly equals `expected_staged_paths`. The internal allowance is not exposed as an MCP parameter; direct `repo_git_commit` calls remain strictly guarded. Green-gate, branch, root, cross-lane, donor and `main` protections remain unchanged.
