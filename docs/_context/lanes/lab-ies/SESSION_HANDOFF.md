# Lab/IES Session Handoff

## Session purpose

This handoff records the durable lane-memory establishment authorised after acceptance of the replacement read-only baseline.

## Current identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Baseline HEAD before this documentation commit: `c4ab11e09e2469e43b84d507890fe802a9ebb85b`
- Gate: `lab-ies`

The historical app-name discrepancy is closed. The current app identity is correct.

## Durable memory set

The lane memory consists of exactly:

1. `docs/_context/lanes/lab-ies/LANE_CHARTER.md`
2. `docs/_context/lanes/lab-ies/LANE_STATE.md`
3. `docs/_context/lanes/lab-ies/WORK_QUEUE.md`
4. `docs/_context/lanes/lab-ies/DECISION_LOG.md`
5. `docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md`
6. `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md`

Purpose of each file:

- `LANE_CHARTER.md` — mission, authority boundaries, ownership and change discipline;
- `LANE_STATE.md` — current verified repository, gate and dirty-inventory state;
- `WORK_QUEUE.md` — ordered future work and dependencies;
- `DECISION_LOG.md` — locked owner decisions and closed issues;
- `EVIDENCE_INDEX.md` — current and historical evidence map;
- `SESSION_HANDOFF.md` — replacement-worker starting point and protected state.

## Current verified baseline

Before lane-memory files were created:

- staged: 0;
- modified: 10;
- untracked: 66;
- deleted: 0.

The bounded `lab-ies` gate passed:

- tests: 147;
- passed: 147;
- failed: 0;
- cancelled: 0;
- skipped: 0;
- todo: 0;
- exit code: 0.

The prior reported HTTP 502 did not recur.

## Protected dirty state

The original ten modified paths are protected and must remain unstaged unless a later path-confined implementation authorisation names them explicitly:

```text
packages/lab-kernel/ies-toolkit/iesApproval.js
packages/lab-kernel/ies-toolkit/iesHandoff.js
packages/lab-kernel/ies-toolkit/iesLabForm.js
packages/lab-kernel/ies-toolkit/iesMetrics.js
packages/lab-kernel/ies-toolkit/iesProvenance.js
packages/lab-kernel/ies-toolkit/iesWrite.js
packages/lab-kernel/ies-toolkit/summary.html
tests/lab-kernel/iesGovernance.test.js
tests/lab-kernel/iesHandoff.test.js
tests/lab-kernel/iesLabForm.test.js
```

The original sixty-six untracked paths are listed exactly in `LANE_STATE.md`. They are likewise protected and must remain unstaged unless explicitly authorised in a later parcel.

The following Selector-owned paths remain permanently outside Lab scope:

```text
packages/workspace-kernel/selectorReferenceOptionsService.js
tests/selectorCascadeCorrectness.test.js
```

They were absent from the current dirty status. Do not infer how they were resolved, and do not touch them.

## Accepted authority foundation

The current evidence supports logical acceptance through Slice 4B:

- canonical keyword and Lab-form foundation;
- non-authoritative working records and normalisation controller;
- rich authority lifecycle;
- RFC 8785-style canonical JSON;
- injected SHA-256 authority boundary;
- approval and derivation binding;
- deterministic immutable sealed DTO;
- GT, OPT and MERGED sealing;
- safe downstream handoff.

MERGED acceptance currently covers the authority/approval/derivation/sealing envelope. It does not establish completion of the final governed N-parent candela-and-power merge.

## Exact next safe worker task

After this lane-memory commit is accepted, the next worker should perform a strictly read-only checkpoint-boundary audit for accepted Slices 1–4B.

### Required scope

Inspect exact diffs and dependencies for:

```text
packages/lab-kernel/ies-toolkit/iesKeywordContract.js
packages/lab-kernel/ies-toolkit/iesWorkingRecord.js
packages/lab-kernel/ies-toolkit/iesNormaliseController.js
packages/lab-kernel/ies-toolkit/iesLabForm.js
packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js
packages/lab-kernel/ies-toolkit/iesCanonicalJson.js
packages/lab-kernel/ies-toolkit/iesAuthorityFingerprint.js
packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js
packages/lab-kernel/ies-toolkit/iesApproval.js
packages/lab-kernel/ies-toolkit/iesProvenance.js
packages/lab-kernel/ies-toolkit/iesReferenceDto.js
packages/lab-kernel/ies-toolkit/iesHandoff.js
```

and corresponding tests under `tests/lab-kernel/`.

### Required outputs

- exact path grouping for Slice 1–2, Slice 3, Slice 4A and Slice 4B;
- dependency order;
- dirty-file collision risks;
- test evidence per parcel;
- independent checkpointability;
- confirmation that prototypes and support files are excluded;
- confirmation that Selector paths are excluded;
- current full `lab-ies` gate result;
- confirmation that no files changed.

### Prohibited actions

- no patching;
- no staging or unstaging;
- no commit or push;
- no reset, restore or clean;
- no deletion, movement or copying;
- no execution of `scripts/clear_chaff.ps1`;
- no donor or staging promotion;
- no new Slice 5 feature work;
- no governed merge implementation;
- no Selector changes.

## Later implementation order

After a read-only checkpoint audit and explicit authorisation:

1. checkpoint accepted Slices 1–4B in path-confined dependency order;
2. audit sealed-reference builder ownership;
3. verify the isolated metrics correction;
4. implement the governed reference merge as separate kernel, governance and UI parcels;
5. implement provenance/resolver publication;
6. integrate only safe downstream contracts.

## Handoff rule

A replacement worker must begin with current `repo_info`, `repo_git_status`, `repo_git_recent` and the bounded `lab-ies` gate. Do not assume this handoff remains current if repository evidence differs.

End state expected for this documentation session:

- exactly six memory files committed with `docs(lab): establish durable lane memory`;
- pushed only from `lane/code-pilot-lab` through the gated path;
- original ten modified and sixty-six untracked paths unchanged and unstaged.