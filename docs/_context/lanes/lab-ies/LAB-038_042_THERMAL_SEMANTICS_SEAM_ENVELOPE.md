# LAB-038 to LAB-042 — Corrected Thermal Semantics Seam Envelope

## Status and controlling decision

- Envelope version: `1`.
- Status: proposed for exact-scope Program & Integrate approval.
- Controlling Program ruling: `docs(program): correct thermal source field semantics`.
- Program ruling evidence: Program gate passed 46/46 and the correction was committed and pushed.
- Correction: legacy `optic_internal_delta_ta_c` is absolute internal reference temperature, not a rise; legacy `optic_uplift_ta_c` is the measured rise.
- No feature implementation is authorised by the Program ruling alone. Each parcel below remains blocked until Program & Integrate approves this exact envelope and file scope.
- The five parcels remain separate and sequential. Approval of the envelope does not authorise combined or parallel implementation.

This envelope supersedes only the thermal field semantics and dependent shapes of the completed LAB-018, LAB-019 and LAB-023 version-1 contracts. All unrelated behaviour, ownership, rollback and safety boundaries remain unchanged.

## Binding thermal model

For one selected optic, Lab source rows contain:

```text
room_ta_c                    -> referenceRoomTaC
optic_internal_delta_ta_c    -> referenceInternalTaC
optic_uplift_ta_c            -> opticThermalRiseTaC
```

The first value is the room condition measured during the Lab reference test. The second value is the absolute internal assembly temperature measured during the same test. The third value is the measured thermal rise.

The measured triplet must satisfy exactly, after canonical decimal normalisation:

```text
referenceRoomTaC + opticThermalRiseTaC === referenceInternalTaC
```

For the current baseline evidence:

```text
25 + 10 = 35
```

The following names are prohibited in new Lab output contracts:

```text
opticInternalDeltaTaC
roomTaC
opticUpliftTaC
```

The legacy snake-case source names may appear only at the source-mapping boundary until a separately approved data-model migration renames them. The recommended later source names are `optic_reference_internal_ta_c` and `optic_thermal_rise_ta_c`.

Lab owns only measured thermal evidence. Lab must not publish, calculate, clamp or infer a user-specific operating temperature. These Engine-owned fields are prohibited from all five parcels:

```text
derivedInternalTaC
curveLookupTaC
boardTaC
verifiedLumensPerMetre
```

The sealed-reference keyword `_INTERNAL_AMBIENT_TA_C` remains the measured internal assembly temperature during the authority test. It is not overwritten or reinterpreted as a runtime-derived operating value.

## Canonical decimal rule

Thermal equality is exact after deterministic decimal normalisation, not an epsilon comparison.

- finite integers and finite decimal source values are accepted;
- values are normalised through their canonical decimal text into a common integer scale;
- exponent notation is normalised deterministically;
- negative zero becomes zero;
- binary floating-point tolerance, rounding-to-fit and approximate equality are prohibited;
- non-finite values, unsupported numeric text and scale overflow fail closed.

## Evidence and identity boundary

The existing legacy `hot_test_battery_applies` value remains an opaque source evidence reference only. It may be projected as `hotTestEvidenceRef`, but it is not parsed into thermal facts and does not by itself prove accepted authority.

The Lab working projection may expose the measured triplet and the opaque evidence reference, but its thermal authority state remains explicitly unresolved until a Program-owned adapter validates accepted evidence and binds it to the selected optic reference identity.

Lab must not fabricate an accepted authority state, evidence digest, reference identity, timestamp or Engine readiness result. Program retains final cross-lane provenance validation and acceptance.

---

# LAB-038 — NVB resolution thermal semantics version 2

## Objective

Replace the ambiguous version-1 optic thermal output names with the corrected measured-triplet semantics and fail closed on missing or contradictory source evidence.

## Contract

The public function names remain unchanged. The schema advances to:

```js
NVB_RESOLUTION_SCHEMA_ID = "controlstack.lab.nvb-resolution.v2"
NVB_RESOLUTION_SCHEMA_VERSION = 2
```

For a resolved optic path, `optic` contains exactly:

```js
{
  opticBomId: string,
  opticVariant: string,
  specCode: string | null,
  emissionPermission: string | null,
  hotTestEvidenceRef: string | null,
  opticalEfficiency: number | null,
  referenceRoomTaC: number,
  referenceInternalTaC: number,
  opticThermalRiseTaC: number
}
```

Rules:

- legacy `room_ta_c` maps only to `referenceRoomTaC`;
- legacy `optic_internal_delta_ta_c` maps only to `referenceInternalTaC`;
- legacy `optic_uplift_ta_c` maps only to `opticThermalRiseTaC`;
- all three measured values are required for a resolved optic path;
- the exact canonical-decimal equation is mandatory;
- missing values add explicit source blockers and keep status unresolved;
- contradictory values add `thermal_triplet_mismatch` and keep status unresolved;
- gear-tray and no-base paths do not invent an optic triplet;
- no user-selected room value, derived temperature, clamp or curve result is accepted or emitted;
- the version-1 names and schema are not emitted through compatibility aliases.

## Exact implementation files

```text
packages/lab-kernel/ies-toolkit/nvbResolve.js
tests/lab-kernel/nvbResolve.test.js
```

## Acceptance

Tests must prove:

- `room_ta_c = 25`, `optic_internal_delta_ta_c = 35`, `optic_uplift_ta_c = 10` resolves to room 25, absolute internal 35 and rise 10;
- the legacy internal-temperature value is never exposed or treated as a rise;
- a second valid optic with rise 15 and matching internal 40 projects rise 15;
- changing only `optic_uplift_ta_c` while leaving the measured internal value contradictory fails closed;
- missing any triplet member fails closed;
- decimal-normalised equality is deterministic;
- source rows and outputs remain immutable;
- no Engine-owned field or legacy semantic output name exists.

Exact feature subject:

```text
lab: checkpoint NVB thermal semantics v2
```

- Gate: `lab-ies`.
- Depends on: `LAB-018-nvb-resolution-contract`.
- On success next: `LAB-039-component-thermal-semantics-v2`.
- Seam change: yes.

---

# LAB-039 — Component projection thermal semantics version 2

## Objective

Advance the component catalogue optic projection to the same corrected measured-triplet vocabulary without changing source loading or component-selection ownership.

## Contract

The public function names remain unchanged. The schema advances to:

```js
COMPONENT_CATALOGUE_SCHEMA_ID = "controlstack.lab.component-catalogue.v2"
COMPONENT_CATALOGUE_SCHEMA_VERSION = 2
```

Each optic projection replaces the three version-1 thermal output names with:

```js
referenceRoomTaC: number
referenceInternalTaC: number
opticThermalRiseTaC: number
```

The legacy snake-case values are mapped only at the source boundary. The exact canonical-decimal equation is mandatory for every projected optic row. Missing, malformed or contradictory thermal triplets fail closed with bounded blockers. `hotTestEvidenceRef` remains opaque and unverified.

## Exact implementation files

```text
packages/lab-kernel/ies-toolkit/nvbComponents.js
tests/lab-kernel/nvbComponents.test.js
```

## Acceptance

Tests must prove exact mapping, schema version 2, deterministic projection order, deep immutability, rejection of the legacy output names, valid varied-optic rise selection, and fail-closed missing or contradictory triplets. The varied-optic success fixture must change legacy `optic_uplift_ta_c` and use a matching absolute internal value; changing only the misleading absolute-internal source field must not prove rise selection.

Exact feature subject:

```text
lab: checkpoint component thermal semantics v2
```

- Gate: `lab-ies`.
- Depends on: `LAB-019-component-projection-contract`, `LAB-038-nvb-resolution-thermal-semantics-v2`.
- On success next: `LAB-040-nvb-lab-thermal-projection-v2`.
- Seam change: yes.

---

# LAB-040 — NVB Lab thermal working projection version 2

## Objective

Migrate the Lab working adapter to consume the corrected resolution schema and expose the raw measured triplet without creating a false accepted thermal authority or Engine result.

## Contract

The schema advances to:

```js
NVB_LAB_ADAPTER_SCHEMA_ID = "controlstack.lab.nvb-lab-projection.v2"
NVB_LAB_ADAPTER_SCHEMA_VERSION = 2
```

The output adds exactly:

```js
thermalEvidence: null | {
  opticBomId: string,
  referenceRoomTaC: number,
  referenceInternalTaC: number,
  opticThermalRiseTaC: number,
  evidenceRef: string | null,
  authorityState: null
}
```

Rules:

- only the corrected LAB-038 version-2 resolution is accepted;
- an optic-path thermal projection is bound to the selected optic BOM identity;
- the exact triplet is revalidated at the adapter boundary;
- `evidenceRef` is the opaque source reference only;
- `authorityState` remains exactly `null` because this Lab adapter does not accept evidence or create Program authority;
- when the optic reference identity projection is absent, `thermal_evidence_reference_unbound` remains explicit in `unresolved`;
- when evidence reference is absent, `thermal_evidence_source_unresolved` remains explicit in `unresolved`;
- a supplied sealed optic identity projection does not silently promote the source thermal row to accepted evidence;
- no runtime-derived, curve, clamp, lm/m or Engine-ready value is emitted;
- no legacy semantic output name remains.

## Exact implementation files

```text
packages/lab-kernel/ies-toolkit/nvbLabAdapter.js
tests/lab-kernel/nvbLabAdapter.test.js
```

## Acceptance

Tests must prove version-2 consumption, exact raw triplet preservation, optic identity association, explicit unresolved authority/evidence state, deep immutability, fail-closed contradiction, and absence of all Engine-owned or legacy semantic fields.

Exact feature subject:

```text
lab: checkpoint NVB Lab thermal projection v2
```

- Gate: `lab-ies`.
- Depends on: `LAB-023-nvb-lab-adapter`, `LAB-038-nvb-resolution-thermal-semantics-v2`.
- On success next: `LAB-041-component-library-thermal-labels`.
- Seam change: yes.

---

# LAB-041 — Component library thermal labels

## Objective

Update the existing read-only component library presentation to display the corrected measured thermal meanings and no deprecated semantic label.

## Exact implementation file

```text
packages/lab-kernel/ies-toolkit/component_library.html
```

## Rules and acceptance

- display `Reference room Ta °C`, `Reference internal Ta °C` and `Optic thermal rise °C`;
- never display `Internal delta`, `Uplift` or a user-specific derived operating temperature;
- retain the evidence reference as visibly unverified source evidence;
- make no Engine lookup, clamp, lm/m or acceptance claim;
- consume only the committed component catalogue version-2 projection;
- change no shared CSS, persistence, route, source fixture or cross-lane implementation.

Exact feature subject:

```text
lab: checkpoint corrected thermal labels
```

- Gate: `lab-ies`.
- Depends on: `LAB-025-component-library-surface`, `LAB-039-component-thermal-semantics-v2`.
- On success next: `LAB-042-thermal-semantics-guard`.
- Seam change: no after approval of this envelope.

---

# LAB-042 — Cross-cutting thermal semantics guard

## Objective

Checkpoint a final test-only guard after the corrected active Lab contracts and surface are committed.

## Exact implementation file

```text
tests/lab-kernel/nvbThermalSemantics.test.js
```

## Acceptance

The guard must independently pin:

- the corrected legacy-source-to-semantic mapping;
- exact 25 + 10 = 35 measured-triplet consistency;
- a valid varied optic whose legacy `optic_uplift_ta_c` differs and whose absolute internal value remains consistent;
- rejection when only the rise changes and the triplet becomes contradictory;
- schema IDs and versions for the three corrected contracts;
- absence of `opticInternalDeltaTaC`, `roomTaC` and `opticUpliftTaC` from active output contracts and presentation;
- absence of `derivedInternalTaC`, `curveLookupTaC`, board temperature, clamp and verified lm/m behaviour from Lab-owned modules and the component surface;
- permission for legacy snake-case field names only inside bounded source-mapping and fixture/test input locations;
- unchanged sealed-reference `_INTERNAL_AMBIENT_TA_C` meaning.

No production source or fixture may change in this parcel.

Exact feature subject:

```text
lab: checkpoint thermal semantics guard
```

- Gate: `lab-ies`.
- Depends on: `LAB-038-nvb-resolution-thermal-semantics-v2`, `LAB-039-component-thermal-semantics-v2`, `LAB-040-nvb-lab-thermal-projection-v2`, `LAB-041-component-library-thermal-labels`.
- On success next: none.
- Seam change: no after approval of this envelope.

## Batch compatibility and rollback

The three corrected contract parcels are intentional schema-version changes. No version-1 compatibility alias is approved. Downstream Lab consumers must migrate through their own listed parcel rather than accepting both shapes silently.

Rollback remains parcel-local and reverse dependency order:

1. revert LAB-042 if present;
2. revert LAB-041;
3. revert LAB-040;
4. revert LAB-039;
5. revert LAB-038;
6. run the full `lab-ies` gate after each revert and push only to the Lab lane;
7. restore the affected queue items to blocked and retain this envelope as historical evidence.

No database, route, source fixture, Selector, Engine or Program rollback is included.

## Approval request

Program & Integrate is asked to approve version 1 of this envelope unchanged, including:

- the corrected semantic mappings;
- exact decimal triplet validation;
- schema version 2 for the three amended Lab contracts;
- five separate sequential parcel scopes;
- explicit unresolved thermal authority in the Lab working projection;
- no Lab-owned runtime derivation, clamp, curve lookup or verified lm/m;
- no legacy output aliases;
- the exact feature subjects, dependencies, tests and rollback order above.

If approved, only LAB-038 moves to `ready`; LAB-039 through LAB-042 remain approved but sequence-blocked.