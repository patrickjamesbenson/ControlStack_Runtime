# ControlStack Lane Registry

**Authority:** Canonical registry of controlled ControlStack development lanes known to Program & Integrate.  
**State date:** 2026-07-17, Australia/Sydney.  
**Classification:** Each field is explicitly marked because this lane cannot directly inspect another lane.

## Registry rules

1. A lane identity is the tuple: lane name, worktree root, required branch, connected secure app, MCP endpoint, and allowed gate.
2. No worker may substitute a similarly named root, branch, app, or gate.
3. A lane must verify its own identity with `repo_info` and `repo_git_status` before work.
4. Program & Integrate does not promote a parcel based solely on this registry. A fresh lane handoff, exact commit, clean/stated Git inventory, and green named gate are required.
5. Repository evidence from the lane outranks this registry when newer. Disagreement must be logged and resolved before integration.

## Active lanes

### 1. Selector & Engine

| Field | Value | Status |
|---|---|---|
| Lane key | `selector-engine` | REPORTED |
| Worktree root | `C:\ControlStack_Worktrees\selector-engine` | REPORTED |
| Required branch | `lane/selector-engine` | REPORTED |
| MCP port | `8000` | REPORTED |
| Runtime port | `8788` | REPORTED |
| Secure app | `CS Selector & Engine Secure` | REPORTED |
| Permitted gate | `selector-engine` | REPORTED |
| Latest accepted gate | `100 passed, 0 failed` | REPORTED |
| Accepted base | `08df070890300058353cc621c1383f16492063f1` | REPORTED |
| Current HEAD | not inspected from this app | UNKNOWN |
| Current dirty state | not inspected from this app | UNKNOWN |

**Purpose — INFERRED from program naming and accepted environment:** Own Selector and Engine implementation and validation, including selector authority derivation, engine contracts, runtime integration surfaces that are explicitly assigned to this lane, and its lane-local tests.

**Restrictions — REPORTED:** One writer in this worktree; no writes to main, Program, Lab, donor, or another lane; only the `selector-engine` gate is permitted; commit and push must use lane-gated paths.

**Current accepted evidence — REPORTED:** The accepted baseline hash is `08df070890300058353cc621c1383f16492063f1`, with a latest accepted gate of 100 passed and 0 failed. These values must be reverified by a fresh Selector handoff before Program acceptance of new work.

### 2. Lab & IES

| Field | Value | Status |
|---|---|---|
| Lane key | `lab-ies` | REPORTED |
| Worktree root | `C:\ControlStack_Worktrees\code-pilot-lab` | REPORTED |
| Required branch | `lane/code-pilot-lab` | REPORTED |
| MCP port | `8021` | REPORTED |
| Specification/demo port | `8899` | REPORTED |
| Secure app | `CS Lab & IES Secure v2` | REPORTED |
| Permitted gate | `lab-ies` | REPORTED |
| Donor root | `C:\ControlStack_Lab` | REPORTED |
| Donor access | read-only | REPORTED |
| Latest accepted gate | bounded gate accepted green | REPORTED |
| Exact accepted commit | not supplied | UNKNOWN |
| Current dirty state | existing modified and untracked IES work deliberately preserved | REPORTED; exact paths UNKNOWN to Program |

**Purpose — INFERRED from accepted environment:** Own Lab and IES specification, demonstration, photometric, and evidence-producing work assigned to this lane.

**Restrictions — REPORTED:** One writer in this worktree; donor `C:\ControlStack_Lab` is read-only; no writes to main, Program, Selector, donor, or another lane; only the `lab-ies` gate is permitted; existing intentional IES changes must not be cleaned, reset, overwritten, staged accidentally, or included in unrelated commits.

**Special protection — REPORTED:** Two prior Selector leak paths were removed and must remain absent. A lane handoff must name those paths or provide repository evidence before Program treats that condition as current truth.

### 3. Program & Integrate

| Field | Value | Status |
|---|---|---|
| Lane key | `program-integrate` | VERIFIED |
| Worktree root | `C:\ControlStack_Worktrees\program-integrate` | VERIFIED |
| Required/current branch | `lane/program-integrate` | VERIFIED |
| MCP endpoint | `127.0.0.1:8022/mcp` | VERIFIED |
| Secure app | `CS Integrate` | REPORTED |
| MCP server identity | `ControlStack Program and Integrate Lane` | VERIFIED |
| Permitted gate | `program-integrate` | VERIFIED |
| HEAD at bootstrap start | `08df070890300058353cc621c1383f16492063f1` | VERIFIED |
| Latest accepted gate before bootstrap | `18 passed, 0 failed` | REPORTED |
| Working tree at bootstrap start | clean | VERIFIED |

**Purpose — REPORTED policy / INFERRED responsibility:** Maintain authoritative program memory, govern seams, queue and accept lane parcels, run the sole gated integration path, and preserve an auditable route toward promotion without allowing feature lanes to mutate integration state directly.

**Verified controls:** Writing and staging are enabled within the configured Program worktree. Commit and push are enabled only through gated controls. Arbitrary shell execution, deletion, movement, and cross-root copy are disabled.

## Reserved and external roots

| Root or surface | Role | Mutation policy | Status |
|---|---|---|---|
| `main` worktree or branch | production/integration destination outside this lane | Feature lanes must not write; Program promotion mechanism must be explicitly authorised and gated | REPORTED policy; current main state UNKNOWN |
| `C:\ControlStack_Lab` | Lab donor/reference | read-only from Lab | REPORTED |
| Program disabled donor placeholder | no active donor | absent | VERIFIED from Program `repo_info` |
| `downstream-artifacts` tunnel | reserved future Engine-output transport | inactive until Engine output contract is stable | REPORTED |

## Lane registration and change control

A new lane or a change to an existing lane identity requires all of the following:

1. Program decision-log entry with rationale and effective date.
2. Exact root, branch, MCP port, secure app, and permitted gate.
3. Tool evidence that writes are confined to the lane and that commit/push are gated.
4. A documented owner and explicit seams.
5. A clean initial handoff, or a complete classified dirty-tree inventory.
6. Program approval before any seam or integration queue item depends on the changed identity.

No chat-only lane identity change is authoritative.