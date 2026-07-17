#requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$AuditOnly
)

$inventoryCommand = 'node "C:\ControlStack_Worktrees\program-integrate\scripts\controlstack_deployment_inventory.mjs"'

throw @"
CONTROLSTACK_ENVIRONMENT_REPAIR.ps1 IS RETIRED AND MUST NOT BE RUN.

The monolithic repair mixed discovery, Git repair, credentials, process replacement,
service registration and rollback. It was abandoned after repeated failed audit runs.

Deployment v2 begins with one read-only inventory:
$inventoryCommand

No repair or service mutation is performed by this retired entry point.
"@
