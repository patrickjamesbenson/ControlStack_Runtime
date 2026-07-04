import assert from "node:assert/strict";
import test from "node:test";

import { clearDbBackedSelectorCascadeChildren, createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { selectorOptionConstraintQueryFromConstraints } from "../packages/modules/cs-selector/index.js";

const SYSTEM_HARD_RESET_CHILD_FIELDS = Object.freeze([
  "optic",
  "opticSub",
  "opticIndirect",
  "diffuserVar1",
  "diffuserVar2",
  "directOpticVar1",
  "directOpticVar2",
  "indirectOpticVar1",
  "indirectOpticVar2",
  "ipRating",
  "ikRating",
  "electricalClass",
  "mountStyle",
  "mountSelection",
  "mountParticulars",
  "powerPenetration",
  "powerLocation",
  "flexLength",
  "wiringType",
]);

function staleConstraintValue(fieldKey) {
  return {
    optic: "60|Opal",
    opticSub: "60|Opal|Soft",
    opticIndirect: "60|Batwing",
    diffuserVar1: "60|Opal",
    diffuserVar2: "60|Opal|Soft",
    directOpticVar1: "60|Comfort",
    directOpticVar2: "60|Comfort|Low glare",
    indirectOpticVar1: "60|Batwing",
    indirectOpticVar2: "60|Batwing|Wide",
    ipRating: "IP-stale-marker",
    ikRating: "IK-stale-marker",
    electricalClass: "electrical-class-stale-marker",
    mountStyle: "Surface Mount",
    mountSelection: "Surface clip",
    mountParticulars: "Flush screw",
    powerPenetration: "Top",
    powerLocation: "Start",
    flexLength: "flex-length-stale-marker",
    wiringType: "wiring-type-stale-marker",
  }[fieldKey] || `stale-${fieldKey}`;
}

test("System hard reset helper clears all downstream DB-backed Selector child constraints", () => {
  const constraints = {
    system: { fieldKey: "system", value: "DNX 60", valueLabel: "DNX 60" },
  };
  for (const fieldKey of SYSTEM_HARD_RESET_CHILD_FIELDS) {
    constraints[fieldKey] = { fieldKey, value: staleConstraintValue(fieldKey), valueLabel: staleConstraintValue(fieldKey) };
  }

  const cleared = clearDbBackedSelectorCascadeChildren(constraints, "system");

  assert.deepEqual(Object.keys(cleared.nextManualConstraints), ["system"]);
  assert.deepEqual([...cleared.clearedFields].sort(), [...SYSTEM_HARD_RESET_CHILD_FIELDS].sort());
});

test("changing System clears stale downstream DB-backed Selector constraints", () => {
  const selectorState = createSelectorState();
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 60");
  for (const fieldKey of SYSTEM_HARD_RESET_CHILD_FIELDS) {
    selectorState.setDbBackedSelectorFieldValue(fieldKey, staleConstraintValue(fieldKey));
  }
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 80 DI");
  const snapshot = selectorState.getSnapshot();
  const constraints = snapshot.dbBackedSelector.manualConstraints;
  assert.equal(Object.keys(constraints).join(","), "system");
  assert.equal(constraints.system.value, "DNX 80 DI");
  assert.match(snapshot.dbBackedSelector.lastAction, /cascade-cleared/);
  for (const staleKey of SYSTEM_HARD_RESET_CHILD_FIELDS) {
    assert.equal(Object.hasOwn(constraints, staleKey), false, `${staleKey} should be cleared after System changes`);
  }

  const query = selectorOptionConstraintQueryFromConstraints(constraints);
  const params = new URLSearchParams(query.replace(/^\?/, ""));
  assert.equal(params.get("system"), "DNX 80 DI");
  for (const staleKey of SYSTEM_HARD_RESET_CHILD_FIELDS) {
    assert.equal(params.has(staleKey), false, `${staleKey} should not be included in refreshed option query`);
  }
});

test("changing directOpticVar1 and mountStyle still clear their existing child constraints only", () => {
  const selectorState = createSelectorState();
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 60 Beam DI");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar1", "60|Comfort");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar2", "60|Comfort|Low glare");
  selectorState.setDbBackedSelectorFieldValue("ipRating", "IP-stale-marker");
  selectorState.setDbBackedSelectorFieldValue("ikRating", "IK-stale-marker");
  selectorState.setDbBackedSelectorFieldValue("mountStyle", "Surface Mount");
  selectorState.setDbBackedSelectorFieldValue("mountSelection", "Surface clip");
  selectorState.setDbBackedSelectorFieldValue("mountParticulars", "Flush screw");

  selectorState.setDbBackedSelectorFieldValue("directOpticVar1", "60|Opal");
  let constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;
  assert.equal(constraints.system.value, "DNX 60 Beam DI");
  assert.equal(constraints.directOpticVar1.value, "60|Opal");
  assert.equal(Object.hasOwn(constraints, "directOpticVar2"), false);
  assert.equal(Object.hasOwn(constraints, "ipRating"), false);
  assert.equal(Object.hasOwn(constraints, "ikRating"), false);
  assert.equal(constraints.mountStyle.value, "Surface Mount");
  assert.equal(constraints.mountSelection.value, "Surface clip");
  assert.equal(constraints.mountParticulars.value, "Flush screw");

  selectorState.setDbBackedSelectorFieldValue("mountStyle", "Suspended");
  constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;
  assert.equal(constraints.mountStyle.value, "Suspended");
  assert.equal(Object.hasOwn(constraints, "mountSelection"), false);
  assert.equal(Object.hasOwn(constraints, "mountParticulars"), false);
  assert.equal(constraints.directOpticVar1.value, "60|Opal");
});
