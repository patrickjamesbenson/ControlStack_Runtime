# Proposal for CP — Lab IES Toolkit lane (request for lane + shape agreement + blessing)

Pat is opening a second, isolated build lane (with an AI assistant) to bring the donor IES Builder into the runtime as **Lab kernel tools**, running alongside your engine slice. This is a request to agree the lane, confirm the shape matches your intended contracts, and give the go-ahead. Nothing has been built.

## Why now
The donor's IES tooling is intact and modular in `lib/photometry/` (parse, build/write, scale `apply_ies_multiplier_once`, mirror, hemisphere detect/mask, merge, merge-hemispheres, interpolate, metrics, schema/export). There is no runtime build brief for it yet — only your rail taxonomy (Reference IES Intake → 1mm Lab Records → Project IES Export) and the disabled `labProof` / `oneMmPolicy` contracts. We want to build it *to your contracts*, not around them.

## The shape (please confirm it matches your intent)
Two distinct operations around one authority artifact — the **1mm JSON**:

1. **Format IES (intake).** Vendor/lab IES comes in inconsistent — name mismatches, grid-angle differences, metadata gaps, wrong length. The tool normalises, **adds all our system fields, with some human-updated** (the risk checkpoint), then on **human approval** becomes the **golden 1mm JSON** — the lab authority object (your `oneMmNormalised`, `baseLengthM: 0.001`, `normalise_1mm_candidate`), carrying provenance, transform/mutation history, and approval state.
2. **Write IES (export).** Take the 1mm JSON, apply **length / temp / candela / power multipliers**, emit an outgoing Project IES that is **stripped of proprietary fields** but **references back** to the job's mutated 1mm JSON.

Provenance rule: origin file stamped as-received; every tool writes a mutation entry into the JSON (tool, params, timestamp, hash); approval/revision state recorded on the JSON itself.

UI: each tool = drag-drop IES/JSON → optional variables → Go → view result, in the Lab sidebar — doubling as test harness and usable tool.

## The lane (how we isolate so we never dirty your tree)
- New package `packages/lab-kernel/ies-toolkit/`, **not imported by `shell.js` / `services.js`** until proven.
- Each tool a **pure, browser-safe** function (no Node-only imports — the `node:crypto` shell break is the cautionary tale). Writes/exports **gated off** by default.
- **One tool per clean commit**, on its own branch, each verified against the donor golden IES test (`tests/test_photometry_golden_ies.py`). Port order: parse + write round-trip first, then metrics, scale, mirror, hemisphere, merge, interpolate.
- Paired generic-lane cleanup: route module diagnostics into the existing dev-only developer-diagnostics gate (`canViewDeveloperDetails` / `data-shell-developer-only`) so the demo view is clean and the diagnostics live in a dev-view drawer.

## Blessing — the asks
1. **Lane:** OK for us to run this as a separate isolated lane (own package + branch), not touching your engine-slice files?
2. **Shape/contracts:** does the 1mm-JSON-as-authority + Format/Write split match your intended `labProof` / `oneMmPolicy` / iesBuilder contracts? Which **schema ids, field names, and provenance/mutation-log format** must we adopt so our tools plug straight into your contracts?
3. **Gating:** what fail-closed / write-gating rules must the tools honour (export disabled until approval, etc.)?
4. **Setup:** you mentioned an alternative to the separate-MCP / ngrok approach — what is it? We'll set the lane up the way you intend.

If the shape is right, we start with the parse + write round-trip tool, gated and golden-tested.
