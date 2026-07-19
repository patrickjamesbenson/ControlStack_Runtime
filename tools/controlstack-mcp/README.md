# Program-local ControlStack MCP snapshot

Status: NON-AUTHORITATIVE CONTRACT SNAPSHOT  
Owner: Program & Integrate for local test references only

## Canonical authority

The deployed and editable ControlStack MCP source is owned by the shared-tooling lane:

- root: `C:\ControlStack_Worktrees\controlstack-tooling-v2`;
- branch: `lane/controlstack-tooling-v2`;
- source: `tools/controlstack-mcp/controlstack_mcp.py`;
- last confirmed guard repair: `2e4d880`.

The adjacent Program copy, `tools/controlstack-mcp/controlstack_mcp.py`, is not a deployment source and must not receive tooling fixes. It remains only because Program tests inspect MCP contract text associated with Program-owned seams.

## Maintenance rule

A tooling defect must be repaired, tested, committed and pushed through the connected shared-tooling app. The Program copy may be refreshed only through an explicit sync parcel that records the canonical source commit, compares the complete source, updates dependent Program tests where necessary, and passes the full `program-integrate` gate.

Do not infer that a successful Program commit updates the deployed MCP service. Do not start this Program-local copy as a replacement for the managed Deployment v2 MCP service.

## Guard repair record

Shared-tooling commit `2e4d880` changed the canonical commit path so `repo_green_commit_push` accepts unrelated unstaged and untracked work only after the actual staged set exactly equals `expected_staged_paths`. The internal allowance is not exposed as an MCP parameter; direct `repo_git_commit` calls remain strictly guarded. Green-gate, branch, root, cross-lane, donor and `main` protections remain unchanged.
