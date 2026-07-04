import assert from "node:assert/strict";
import test from "node:test";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";

test("changing System clears stale downstream DB-backed Selector constraints", () => {
  const selectorState = createSelectorState();
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 60");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar1", "60|Comfort");
  selectorState.setDbBackedSelectorFieldValue("ipRating", "IP65");
  selectorState.setDbBackedSelectorFieldValue("mountStyle", "Surface Mount");
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 80 DI");
  const constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;
  assert.equal(Object.keys(constraints).join(","), "system");
  assert.equal(constraints.system.value, "DNX 80 DI");
});
