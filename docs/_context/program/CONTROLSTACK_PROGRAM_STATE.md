# ControlStack Program State

**Authority:** Program-level repository memory for orchestration and integration.  
**Location:** `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md`  
**State date:** 2026-07-17, Australia/Sydney.  
**Evidence rule:** Repository and connected-app evidence overrides chat history. Every material claim is labelled `VERIFIED`, `REPORTED`, `INFERRED`, or `UNKNOWN`.

## Evidence classifications

- **VERIFIED** — directly observed in the current repository or returned by the connected CS Integrate app during this bootstrap.
- **REPORTED** — supplied as accepted coordination input but not independently inspected from the relevant lane in this session.
- **INFERRED** — a reasoned program conclusion derived from verified or reported evidence.
- **UNKNOWN** — not established by current evidence and must not be silently assumed.

## Current program identity

| Item | State | Evidence |
|---|---|---|
| Lane | `program-integrate` | VERIFIED by `repo_info` |
| Worktree root | `C:\ControlStack_Worktrees\program-integrate` | VERIFIED by `repo_info` and `repo_git_status` |
| Required/current branch | `lane/program-integrate` | VERIFIED by `repo_info` and `repo_git_status` |
| HEAD at bootstrap start | `08df070890300058353cc621c1383f16492063f1` | VERIFIED by `repo_git_recent` |
| MCP endpoint | `127.0.0.1:8022/mcp` | VERIFIED by `repo_info` |
| Connected secure app | `CS Integrate` | REPORTED by accepted environment; connected server identifies itself as `ControlStack Program and Integrate Lane` |
| Allowed gate | `program-integrate` | VERIFIED by `repo_info` |
| Working tree at bootstrap start | clean; no staged, modified, untracked, or deleted paths | VERIFIED by `repo_git_status` |
| Latest accepted Program gate before bootstrap | 18 passed, 0 failed | REPORTED |

## Connected-app capability boundary

| Capability | State | Evidence |
|---|---|---|
| Write inside this worktree | enabled | VERIFIED by `repo_info`; write root is the configured runtime root |
| Stage explicit paths inside this worktree | enabled | VERIFIED by `repo_info` |
| Commit | enabled and gate-controlled | VERIFIED by `repo_info` |
| Push | enabled and gate-controlled | VERIFIED by `repo_info` |
| Arbitrary shell execution | disabled | VERIFIED by `repo_info` |
| File deletion | disabled | VERIFIED by `repo_info` |
| File/directory movement | disabled | VERIFIED by `repo_info` |
| Cross-root copy | disabled | VERIFIED by `repo_info` |
| Writable main or another worktree | unavailable through this app | VERIFIED operationally from configured runtime confinement and disabled cross-root mutation; exact filesystem ACLs outside the app are UNKNOWN |
| Donor/reference root | configured disabled placeholder under this worktree; does not exist | VERIFIED by `repo_info` |

## Current program milestone

**Milestone: Durable orchestration memory bootstrap.**

- Establish repository-owned program state, lane registry, seam contracts, integration queue, decision log, orchestration contract, and fresh-orchestrator handoff. **VERIFIED as the authorised task.**
- Do not begin or continue feature implementation in this parcel. **VERIFIED as the authorised task boundary.**
- Replace reliance on chat-only coordination with versioned repository context. **REPORTED as a global program rule and accepted here as the governing objective.**

## Accepted lane environment

### Selector & Engine

- Root `C:\ControlStack_Worktrees\selector-engine`. **REPORTED**
- Branch `lane/selector-engine`. **REPORTED**
- MCP port `8000`. **REPORTED**
- Runtime port `8788`. **REPORTED**
- Secure app `CS Selector & Engine Secure`. **REPORTED**
- Gate `selector-engine`. **REPORTED**
- Latest accepted gate `100 passed, 0 failed`. **REPORTED**
- Accepted base `08df070890300058353cc621c1383f16492063f1`. **REPORTED**
- The accepted base equals this Program lane's bootstrap-start HEAD. **VERIFIED comparison of the reported hash with current Program HEAD; current Selector HEAD remains UNKNOWN.**

### Lab & IES

- Root `C:\ControlStack_Worktrees\code-pilot-lab`. **REPORTED**
- Branch `lane/code-pilot-lab`. **REPORTED**
- MCP port `8021`. **REPORTED**
- Specification/demo port `8899`. **REPORTED**
- Secure app `CS Lab & IES Secure v2`. **REPORTED**
- Gate `lab-ies`. **REPORTED**
- Donor `C:\ControlStack_Lab` is read-only. **REPORTED**
- Selector leaks were removed. **REPORTED**
- Existing modified and untracked IES work is deliberately preserved. **REPORTED**
- Latest bounded gate was accepted green. **REPORTED; exact pass count and commit are UNKNOWN.**

### Program & Integrate

- Root `C:\ControlStack_Worktrees\program-integrate`. **VERIFIED**
- Branch `lane/program-integrate`. **VERIFIED**
- MCP port `8022`. **VERIFIED**
- Secure app `CS Integrate`. **REPORTED**
- Gate `program-integrate`. **VERIFIED**
- Latest accepted gate before this bootstrap `18 passed, 0 failed`. **REPORTED**

## Repository baseline observed in this lane

- The repository package is named `controlstack-runtime`, version `0.1.0`, private, ESM, with `npm test` mapped to `node --test tests/*.test.js`. **VERIFIED from `package.json`.**
- The repository contains runtime feature code, a workspace shell, packages, scripts, tools, and a large Node test suite. **VERIFIED from repository inspection.**
- Before this bootstrap, `docs/` contained only `ies-report-card-generator.md` and `docs/donor-reference/selector/DONOR_TRACE_RULES.md`; no equivalent program-state or program-handoff documents existed. **VERIFIED from repository file search.**
- The Program worktree currently shares a feature-rich runtime history whose latest commits concern Selector option authority and runtime behaviour. **VERIFIED from recent commit subjects.**
- Whether those feature commits were integrated through the formal Program acceptance process is **UNKNOWN** because durable acceptance records did not yet exist.

## Program-wide operating rules

The following rules are accepted program policy. Their origin is coordination input; enforcement support is partly verified through the connected app.

1. One writer per worktree. **REPORTED policy; INFERRED necessary control.**
2. Feature lanes cannot write `main` or another worktree. **REPORTED policy; current app confinement is VERIFIED.**
3. Program & Integrate is the sole gated integration path. **REPORTED policy.**
4. Arbitrary shell, deletion, movement, and cross-root copy are disabled. **VERIFIED for this app.**
5. Commits and pushes are gated. **VERIFIED for this app.**
6. Chat context is not authoritative project memory. **REPORTED policy, adopted by these documents.**
7. Repository context documents are authoritative. **REPORTED policy, adopted by these documents.**
8. The `downstream-artifacts` tunnel remains reserved and inactive until the Engine output contract is stable. **REPORTED.**
9. Secure tunnel restart automation is operational hardening, not feature work. **REPORTED.**

## Current work inventory

At bootstrap start the Git inventory was empty. **VERIFIED.**

This documentation parcel is intentionally limited to:

- `docs/_context/program/CONTROLSTACK_PROGRAM_STATE.md`
- `docs/_context/program/CONTROLSTACK_LANE_REGISTRY.md`
- `docs/_context/program/CONTROLSTACK_SEAM_CONTRACTS.md`
- `docs/_context/program/CONTROLSTACK_INTEGRATION_QUEUE.md`
- `docs/_context/program/CONTROLSTACK_DECISION_LOG.md`
- `docs/_context/program/CONTROLSTACK_ORCHESTRATION_CONTRACT.md`
- `docs/_context/program/CONTROLSTACK_PROGRAM_HANDOFF.md`

No feature file is authorised for modification in this parcel. **VERIFIED task boundary.**

## Known blockers and risks

- Lane evidence from Selector and Lab is reported, not directly verified by this app. Their current branch, HEAD, dirty state, and live services may have changed. **UNKNOWN current state / VERIFIED evidence limitation.**
- Program acceptance history predating these documents is not durable or fully reconstructable from repository evidence alone. **UNKNOWN.**
- Program branch divergence from `origin/lane/program-integrate` is not quantified by the status response beyond the branch display. **UNKNOWN.**
- Main-branch state and promotion mechanism are outside the connected root and were not inspected. **UNKNOWN.**
- The Engine output contract is not yet declared stable; therefore downstream-artifact activation must remain held. **REPORTED.**
- The secure tunnel restart automation is not evidenced in this repository inspection. **REPORTED requirement; implementation state UNKNOWN.**

## Acceptance status

- Identity and capability checks: **VERIFIED PASS.**
- Existing-document duplication check: **VERIFIED PASS; no equivalent program files found.**
- Documentation creation: **VERIFIED PASS; exactly seven canonical Program files were created and inspected.**
- Scoped staging: **VERIFIED PASS; exactly the seven named documentation paths were staged and no feature paths were present.**
- `program-integrate` gate: **VERIFIED PASS on 2026-07-17; 18 passed, 0 failed.**
- Gated commit and push: **TO BE IDENTIFIED by the commit containing this document and the connected-app execution receipt.**

The commit containing this document, the gate result above, the push receipt, and final `repo_git_status` are the authoritative execution evidence for this bootstrap parcel.