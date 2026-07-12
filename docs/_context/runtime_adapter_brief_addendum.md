# Addendum to the runtime safe-handoff adapter brief

Two hardening notes so the worker catches a real integration snag up front, not after wiring.

## 1. Match forbidden fields by EXACT key name — never by substring
The required field set itself contains "photometry" as a substring:
`sourcePhotometryRef`, `photometryReferenceFingerprint`, `iesPhotometryReferenceToken`, `sourcePhotometryStatus`.
A substring scan for forbidden words (`photometry`, `candela`, `keywords`, …) would **reject valid handoffs**.

The fail-closed check MUST:
- walk object keys (top-level and nested) and block only on **exact** forbidden key names:
  `ies, iesText, rawIes, rawIesText, rawIesContent, photometry, rawPhotometry, candela, candelaGrid, candelaArrays, base64, base64Artifacts, filename, fileName, localPath, privatePath, mutationLog, provenance, approval, keywords, vendorData, labRecord, recordBody, rawRecord`
- treat compound names that merely *contain* those words as ALLOWED
  (e.g. `photometryReferenceFingerprint`, `sourcePhotometryRef` are valid, not leaks).

## 2. Test against the ACTUAL handoff shape (fixture below), not a hand-made guess
The lab handoff carries **no `rawExposed`/flag object** — the guarantee is the pure **absence** of raw fields plus `safeSummaryOnly: true` / `readOnly: true`. Use this exact fixture in the tests:

```json
{
  "schemaId": "controlstack.lab.safe-runtime-handoff.v1",
  "schemaVersion": 1,
  "handoffState": "ready",
  "approvalState": "reference",
  "sourcePhotometryStatus": "available",
  "oneMmNormalised": true,
  "baseLengthM": 0.001,
  "oneMmPolicyLabel": "normalise_1mm_candidate",
  "sourcePhotometryRef": "safe-aaaa",
  "iesPhotometryReferenceToken": "safe-bbbb",
  "photometryReferenceFingerprint": "safe-bbbb",
  "sourceInputFingerprint": "safe-aaaa",
  "recordFingerprint": "safe-bbbb",
  "derivedFromFingerprint": null,
  "recordType": "Base Engine",
  "referenceEngineToken": "BARE-ENG_R840_300mA",
  "lumenCurveReferenceToken": null,
  "driverUtilCurveReferenceToken": null,
  "boardDataSourceVersion": null,
  "selectedFamilySubsetLock": null,
  "unresolvedCount": 0,
  "safeSummaryOnly": true,
  "readOnly": true
}
```

Required tests:
- **valid fixture** → adapter maps to ready; board-owned nulls (`lumenCurveReferenceToken`, `driverUtilCurveReferenceToken`, `boardDataSourceVersion`, `selectedFamilySubsetLock`) filled from boardData when present; **`derivedFromFingerprint: null` does NOT block**.
- **tampered fixture** (inject e.g. `"candela": [[1]]` or `"iesText": "…"`) → fail-closed with a safe blocker token; the forbidden field is **absent** from adapter output.
- **wrong-state fixture** (`readOnly: false`, or `safeSummaryOnly: false`, or `handoffState: "blocked"`) → fail-closed.
