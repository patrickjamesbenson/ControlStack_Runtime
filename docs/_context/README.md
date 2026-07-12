# ControlStack — durable context docs

The living context for the ControlStack build, committed here so it survives a chat dying (previously these existed only in an uploaded zip). Written into `C:\ControlStack_Lab\docs\_context\` on 12 Jul 2026.

## Start here
- **ControlStack_finish_line_map.md** — the scoreboard. Selector → run → engine → output, each stage marked done / in-progress / off. Refreshed 12 Jul against live code. This is the gauge; paste CP status updates against it.
- **CP_orchestrator_handoff_prompt.md** — paste into a fresh CP chat to hand over the whole project cleanly.

## Registers & contracts
- **ControlStack_gap_register.md** — donor → runtime parity: what the donor does, whether the runtime has it, port vs design, blind spots.
- **ControlStack_output_spine_contract.md** — Stage 4 chain (RunTable → lumen → IES), each item PORT or DESIGN.
- **ControlStack_shape_contract_status.md** — selector shape+order contract implementation status (9 Jul snapshot; Fix 5 has since landed).
- **ControlStack_selector_shape_order_contract.md** — the contract itself (Fixes 1–7).
- **ControlStack_selector_field_provenance.md** — the 17 selector fields, live vs stub, source tables.
- **ControlStack_data_shape_for_CP_now.md** — shape decisions to bake in now (board capacity vs intent, CCT/CRI pairing, canonical names).
- **ControlStack_read_only_actuals_2026-07-09.md** — live read-only snapshot of the running runtime (selector options, the IES manifest).

## Lab lane
- **ControlStack_Lab_provenance_system_map.md** — the quality system: how an IES becomes a controlled, reproducible reference (the big picture).
- **ControlStack_Lab_data_sources_and_store_spec.md** — reference store layout, naming, resolver, port plan.
- **ControlStack_lab_ies_toolkit_plan.md** / **ControlStack_lab_tool1_spec_and_setup.md** — toolkit port plan + tool #1 spec + worktree setup.
- **ControlStack_lab_lane_proposal_for_CP.md** / **ControlStack_lab_lane_AGREEMENT_cp_blessed.md** — the lane proposal and CP's blessed contract.
- **ControlStack_lab_toolkit_handoff_for_CP.md** — how the runtime must call the toolkit (recipes-only rule + safe boundary).
- **runtime_adapter_brief_addendum.md** — hardening notes + fixture for the safe-handoff adapter.
- **BASE_LAB_FORM_v2.csv** — the lab record template (kind + gates_reference columns).

## Framework & research
- **ControlStack_DataLogger_feature_register.md** — F1 (external source register + freshness) and F2 (AI-assisted intake classifier) for CP.
- **ControlStack_TODO_board_lumen_prewarm.md** — the deferred Stage-4 blocker (donor lumen-curve prewarm not ported).
- **ControlStack_UGR_verification_status.md** — UGR CLOSED: CIE 190 verified to the decimal.
- **ControlStack_zencontrol_EM_research_mission.md** — the emergency-converter data-gathering brief.
