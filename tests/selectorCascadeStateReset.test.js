import assert from "node:assert/strict";
import test from "node:test";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { selectorOptionConstraintQueryFromConstraints } from "../packages/modules/cs-selector/index.js";

test("changing System clears stale downstream DB-backed Selector constraints", () => {
  const selectorState = createSelectorState();
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 60");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar1", "60|Comfort");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar2", "60|Comfort|Low glare");
  selectorState.setDbBackedSelectorFieldValue("ipRating", "IP65");
  selectorState.setDbBackedSelectorFieldValue("ikRating", "IK10");
  selectorState.setDbBackedSelectorFieldValue("mountStyle", "Surface Mount");
  selectorState.setDbBackedSelectorFieldValue("mountSelection", "Surface clip");
  selectorState.setDbBackedSelectorFieldValue("electricalClass", "Class I");
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 80 DI");
  const snapshot = selectorState.getSnapshot();
  const constraints = snapshot.dbBackedSelector.manualConstraints;
  assert.equal(Object.keys(constraints).join(","), "system");
  assert.equal(constraints.system.value, "DNX 80 DI");
  assert.match(snapshot.dbBackedSelector.lastAction, /cascade-cleared/);
  for (const staleKey of [
    "directOpticVar1",
    "directOpticVar2",
    "ipRating",
    "ikRating",
    "mountStyle",
    "mountSelection",
    "electricalClass",
  ]) {
    assert.equal(Object.hasOwn(constraints, staleKey), false, `${staleKey} should be cleared after System changes`);
  }

  const query = selectorOptionConstraintQueryFromConstraints(constraints);
  const params = new URLSearchParams(query.replace(/^\?/, ""));
  assert.equal(params.get("system"), "DNX 80 DI");
  for (const staleKey of ["directOpticVar1", "directOpticVar2", "ipRating", "ikRating", "mountStyle", "mountSelection"]) {
    assert.equal(params.has(staleKey), false, `${staleKey} should not be included in refreshed option query`);
  }
});
