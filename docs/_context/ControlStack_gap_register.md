# Donor → Runtime gap register (central source of truth)

The single place that answers: what does the donor do, does the runtime have it, did CP audit it, is it shaped right, and what's the action. Maintained by the background sweep. Read-only findings; no code changed.

**Legend**
- Runtime status: ✅ present · 🟡 stub/partial · ⬜ absent
- CP audit: **known** (in CP's chat audits) · **blind-spot** (not found in CP's audits) · **?** (unconfirmed)
- Verified: ✔ I checked donor + runtime code · ~ inferred from CP's audit, not yet re-checked
- Stage: which stage it blocks (per finish-line map)
- Action: port · contract · defer (safe) · fix

**Last updated:** 9 Jul 2026.

---

## A. Confirmed by our own sweep (verified against code)

| Capability | Donor evidence | Runtime | CP audit | Verified | Stage | Action |
|---|---|---|---|---|---|---|
| Board lumen curve prewarm (lm at real current+temp) | `lib/planning/board_lumen_util.py` prewarm + `get_board_lm_per_m`; `pitch_resolver.py` family grouping | ⬜ absent (uses 25°C headline + single-length stub) | **blind-spot** | ✔ | 4 | port |
| Selector option ordering (source order + first-is-default) | donor: comma-delimited, author-ordered lists | 🟡 re-sorted alphabetically | **blind-spot** | 3 | ✔ | contract |
| Selector stand-in vocab vs real (optic/IK/CCT-CRI) | real OPTICS/BOARDS values | 🟡 invented preview tokens | **blind-spot** | 3 | ✔ | contract |
| CCT/CRI pairing | BOARDS `c1_cct`/`c1_cri_min` per channel | 🟡 separate dropdowns | **blind-spot** | 3 | ✔ | contract |
| Shell boot (node:crypto) | n/a (runtime bug) | ⬜ broken at boot | n/a | ✔ | — | fix (immediate) |

## A2. Output-spine verification — Phase 1 (9 Jul, verified against code)

Donor maturity matters: an item is only a cheap "port" if the donor actually implemented it. Some deferred items are donor-**stubs** = real design work.

| Capability | Donor evidence | Donor maturity | Runtime | CP audit | Action |
|---|---|---|---|---|---|
| RunTable generation | `lib/planning/run_engine.py` (~4,100 lines) | ✅ implemented | ⬜ off (narrow scaffold) | **known** | port (donor = spec) |
| IES representation / parse | `lib/photometry/ies.py` + `tests/test_photometry_golden_ies.py` (golden) | ✅ implemented | ⬜ off | **known** | port + verify vs golden |
| IES scaling (base-IES select + scale to lm/CCT/CRI) | `lib/payloads/ies_scale.py` — header: "v1 intentionally does NOT produce a scaled IES… placeholder" | 🟥 **stub — undesigned** | ⬜ absent | **blind-spot** | DESIGN (not a port) |
| Lumen → IES link | scaling consumes `target_lm_per_m`, `cct`, `cri`, `base_ies_key` (per ies_scale stub) | depends on lumen prewarm (A) + IES scaling design | ⬜ absent | **blind-spot** | design + port prewarm |

**Verification asset found:** `tests/test_photometry_golden_ies.py` is a golden IES reference — this is what we'd use to prove a future runtime IES matches donor output.

## B. Flagged by CP's own audits (from chat; mostly not yet re-verified by us)

| Capability | Runtime (per CP) | CP audit | Verified | Stage | Action |
|---|---|---|---|---|---|
| Segment-aware board placement / split | 🟡 policy named, not physically enforced | **known** (top-5 #1) | ~ | 3 | port |
| Board packing / coin-change optimisation | 🟡 greedy feasibility only | **known** (top-5 #2) | ~ | 3 | port |
| Reservation → coordinate map (cannot bisect board) | 🟡 narrow fixed-span only | **known** (top-5 #3) | ~ | 3 | port |
| Join-rule enforcement (board/diffuser/do-not-bridge) | 🟡 represented, not enforced | **known** (top-5 #4) | ~ | 3 | port |
| Cross/no-cross electrical topology (secondary_across_segment) | 🟡 diagnostic only; patch not landed | **known** (top-5 #5) | ~ | 3 | port |
| Segment length rules (max/min/aesthetic, short-piece, split modes) | 🟡 represented | **known** | ~ | 3 | port |
| Driver sizing / topology / util penalties | 🟡 scaffold only (donor: `driver_selector.py`, `electrical_sizer.py`) | **known** | ~ | 3/4 | port |
| Emergency / EWIS / driver hardware reservation | ⬜ diagnostic-only | **known** | ~ | 4 | defer/port |
| Full RunTable generation | ⬜ off | **known** | ~ | 4 | port |
| IES generation | ⬜ off | **known** | ~ | 4 | port (needs A: lumen prewarm) |
| Selected-result persistence | ⬜ off (plumbing in progress) | **known** | ~ | 4 | port |

## C. CP's "safe to leave behind" (defer, per CP — sanity-check later)

DXF/manufacturing drawing generation (`board_placeholder.py`, `factory_component_builder_core.py`), factory output preview UI, final DXF/SVG, full AS/NZS 2293 emergency compliance, donor UI-only snap hints. Marked **known/defer**; we should confirm none of these secretly feed the selector→run→output spine.

---

## Blind spots found so far (not in CP's audits)
1. **Board lumen-curve prewarm / lm-at-temperature** — feeds IES accuracy; CP lists "IES generation" but not the underlying real-lumen subsystem. (verified)
2. **Selector input shaping** — order, stand-in vocabulary, CCT/CRI pairing. CP audits the board/packing mechanics but not the selector's input-shape fidelity. (verified)
3. **IES Builder toolset is a whole subsystem not yet in the runtime** — donor `lib/photometry/` has a full modular IES toolkit (parse, write, scale, mirror, hemisphere mask, merge, merge-hemispheres, interpolate, metrics). Earmarked for production as **Lab kernel tools**. Not ported. This is the single biggest missing capability found so far. (verified — see ControlStack_lab_ies_toolkit_plan.md)

**Correction (was blind spot #3, now resolved):** an earlier note said "IES scaling is undesigned even in the donor." That was wrong — the scale op exists (`apply_ies_multiplier_once`); `ies_scale.py` was only an unfinished wrapper. The scale operation is a PORT. The only DESIGN part is how the selector auto-selects a base IES and sequences the tools.

These are the payoff of sweeping independently rather than trusting the audit wholesale.

## Key insight — "port" vs "design"
Not all deferred items are equal effort. **Port (cheap, donor is spec):** lumen prewarm, RunTable (`run_engine.py`), IES representation + the whole IES toolkit (`lib/photometry/`). **Design (real work):** base-IES selection + the selector's auto tool-sequence (the tools themselves are ported). Sort every future gap into port vs design so effort is honest.

---

## D. Downstream selector modules (mounted, but data-starved) — verified 9 Jul

All four hang off the selector and are **already mounted in the shell as read-only diagnostic panels** consuming the `downstream` context (a placeholder). Shell integration is NOT the blocker. Each needs two independent tracks: **data-unlock** (the selector/engine output projection — selected-result → RunTable → payload, Stage 4, off) and **donor-port** (the real subsystem logic). Dependency order: scene builder first → emergency/EGRES last.

| Module | Shell mount | Runtime code | Data-unlock needs | Donor-port source | Order |
|---|---|---|---|---|---|
| Scene builder | ✅ mounted (structural) | 🟡 partial (most built) | committed selector state + scene compose | `lib/scenes` | 1 |
| Compliance matters | ✅ mounted (diagnostic) | ⬜ low (viewer only) | selected-result + compliance rules | `lib/compliance` | 3 |
| Coordinated surfaces | ✅ mounted (diagnostic; drawing/setout/clash authorities OFF) | ⬜ low (viewer only) | run layout output + drawing generation | DXF/coordination (`lib/dxf_studio`) | 3 |
| Emergency / EGRES | ✅ mounted (diagnostic; most blocked) | ⬜ low (viewer only) | RunTable output + AS/NZS 2293 life-safety proof | `lib/emergency` + emergency zone foothold | 4 (last) |

**Key point:** don't mistake a mounted diagnostic panel for a finished module. The single unlock for all four is the **selector/engine output shape** (the same Stage 4 projection the output plumbing + lab safe-handoff are driving toward). Defining that shape lights them up in dependency order; the donor-port is the separate second track.

## Sweep plan (background, while CP does thin-slice)
- **Phase 1 — verify the spine (next):** re-check CP's "known" rows in group B that feed selector→run→output, against real donor+runtime code; upgrade `~` to `✔` or reclassify. Priority order: photometry/lumen → RunTable → IES → electrical.
- **Phase 2 — sweep for more blind spots:** subsystem by subsystem (planning, electrical, zones, emergency), donor vs runtime, add rows.
- **Phase 3 — draft contracts** for confirmed spine gaps (donor is the spec), like the shape+order and prewarm notes.
- **Phase 4 — batch to CP**, prioritized. Keep shell fix separate/immediate.

## What to hand CP first (once you're ready)
1. Shell fix (one line — unblocks your ability to see anything). Immediate, standalone.
2. Nothing else yet — the parity items should go over after Phase 1 verification so you're not handing him unverified TODOs.
