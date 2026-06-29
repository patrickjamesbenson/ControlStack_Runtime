# Donor Trace Rules — Selector Runtime Work

This document records the donor-reference rules for Selector-related runtime slices.

## Authority order for red-test diagnosis

When a runtime test fails, the donor/source sequence is the first authority for diagnosis:

1. Read the failing assertion.
2. Identify actual versus expected.
3. Inspect the runtime path that produced the actual value.
4. Inspect the donor/source behaviour that defines the expected value.
5. Patch the source-path cause in runtime implementation.
6. Rerun the fixed runtime gate.

Tests, snapshots, and fixtures must not be mutated merely to force a pass.

## Donor relationship

Donor code is reference only. It may be inspected for source-backed behaviour, but runtime work must not depend on the donor repository existing forever.

Runtime implementation must preserve source-backed behaviour where that behaviour is part of the accepted Selector contract.

## Current bounded authority

Selector resolves selections. Selector does not prove.

Lab Proof proves later, after the approved Lab authority contract exists.

These slices do not create generation authority, write authority, approval authority, proof authority, KC write-back, CLX write-back, or runtime data write workflows.
