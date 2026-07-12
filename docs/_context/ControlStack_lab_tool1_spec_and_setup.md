# Lab tool #1 — parse + write round-trip (spec + lane setup)

First tool in the lab-ies-toolkit lane. Deliberately minimal: prove an IES file survives parse → write → parse unchanged, verified against the donor golden fixtures. No 1mm schema, no provenance, no runtime handoff yet — those are tools #2–5.

## Who checks it before commit? (your question)
The safety is not "CP reviews every commit." It's three things by design:
1. **Isolation** — nothing imports this package; it cannot touch the runtime, shell, or engine. It literally can't break CP's work.
2. **Golden test** — objective pass/fail against the donor fixtures.
3. **You commit** only allowlisted files, on the isolated branch.

So: green golden test + your commit is enough. Recommended extra: have CP eyeball **tool #1 only**, to confirm the shape lands his contract; after that it's routine.

## Lane setup — git worktree (protects CP's live work)
Use a **worktree**, not a branch-switch. A worktree makes a *separate folder* on the new branch, leaving `C:\ControlStack_Runtime` on `main` untouched so CP keeps working undisturbed. (Do NOT run `git checkout -b` inside `C:\ControlStack_Runtime` — that would switch CP's folder.)

```
cd C:\ControlStack_Runtime
git fetch origin
git worktree add -b lab-ies-toolkit C:\ControlStack_Lab origin/main
```
If the branch already exists, drop `-b`: `git worktree add C:\ControlStack_Lab lab-ies-toolkit`

Create folders + copy the donor golden fixtures:
```
cd C:\ControlStack_Lab
mkdir packages\lab-kernel\ies-toolkit
mkdir tests\lab-kernel\fixtures\ies
copy C:\ControlStack\tests\fixtures\ies\constant_100cd_full_azimuth.ies tests\lab-kernel\fixtures\ies\
copy C:\ControlStack\tests\fixtures\ies\constant_100cd_half_azimuth.ies tests\lab-kernel\fixtures\ies\
```
Run the test / commit when green:
```
node --test tests/lab-kernel/
git add packages/lab-kernel/ies-toolkit tests/lab-kernel
git commit -m "lab-ies-toolkit tool 1: IES parse+write round-trip (golden)"
git push -u origin lab-ies-toolkit
```
Remove the worktree later (optional): `git worktree remove C:\ControlStack_Lab`

## The tool

**Port from donor:** `parse_ies` and `build_ies_text` (both in `lib/photometry/ies.py`), JS translation.

**Internal model** (from the donor): `{ photometry: { v_angles:number[], h_angles:number[], candela:number[][], geometry:{ G2, ... } }, header:{...} }`.

**Files (allowlist-only):**
- `packages/lab-kernel/ies-toolkit/iesParse.js` — `parseIes(text|bytes) -> model`
- `packages/lab-kernel/ies-toolkit/iesWrite.js` — `writeIes(model) -> text`
- `tests/lab-kernel/iesRoundTrip.test.js` — golden acceptance

**Acceptance test (mirrors donor `test_golden_roundtrip_parse_build_parse_is_stable`):**
For each golden fixture: `w1 = parseIes(raw)` → `text = writeIes(w1)` → `w2 = parseIes(text)`, then assert:
- `w1.photometry.v_angles === w2.photometry.v_angles`
- `w1.photometry.h_angles === w2.photometry.h_angles`
- `w1.photometry.candela === w2.photometry.candela` (deep equal)
- `w1.photometry.geometry.G2 === 1.0` and `w2 …=== 1.0`

**Rules (CP's contract):**
- Pure, **browser-safe** functions — no `node:crypto`, no `node:fs` inside the tool (the *test* may use `fs` to load fixtures; the tool functions are string/object in-out only).
- No file writes; no runtime imports; no routes/POST/mutation.
- Lives only under the allowlist (`packages/lab-kernel/ies-toolkit/**`, `tests/lab-kernel/**`).

**UI (later, not tool #1):** drag-drop IES → Go → show parsed model + re-written IES + a "round-trip matches ✓/✗" badge. Sidebar Lab tool.

## How the code reaches the worktree
My file tools write to `C:\ControlStack` and `C:\ControlStack_Runtime` only — not `C:\ControlStack_Lab`. So for each tool I'll deliver the code as files you drop into the worktree folder (simple copy), then you run the test and commit. If you'd rather I write straight into the worktree, add `C:\ControlStack_Lab` as a folder I can access and I'll place files directly.

## Next
On your go, I'll write `iesParse.js`, `iesWrite.js`, and the round-trip test, ported from the donor, ready to drop into `C:\ControlStack_Lab`.
