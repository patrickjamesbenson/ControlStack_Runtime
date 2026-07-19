from __future__ import annotations

"""Fail-closed tombstone for the non-authoritative Program-local MCP path.

The deployed and editable ControlStack MCP source is owned by the shared-tooling
lane at:

    C:\\ControlStack_Worktrees\\controlstack-tooling-v2\\tools\\controlstack-mcp\\controlstack_mcp.py

Program-only contract tests use:

    tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py

Do not patch, import, execute, or deploy this tombstone as an MCP server.
"""

raise SystemExit(
    "NON-AUTHORITATIVE PROGRAM TOMBSTONE: use the shared-tooling lane for MCP "
    "changes; Program-only contract tests use "
    "tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py."
)
