import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CanonicalJsonError,
  canonicalizeJson,
  canonicalizeJsonBytes,
} from "../../packages/lab-kernel/ies-toolkit/iesCanonicalJson.js";

test("canonicalizes the practical RFC 8785 number and literal vector", () => {
  const input = {
    numbers: [333333333.33333329, 1e30, 4.50, 2e-3, 1e-27],
    literals: [null, true, false],
  };
  assert.equal(
    canonicalizeJson(input),
    '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27]}',
  );
});

test("top-level and nested object insertion order do not affect canonical output", () => {
  const left = { z: { beta: 2, alpha: 1 }, a: true };
  const right = { a: true, z: { alpha: 1, beta: 2 } };
  assert.equal(canonicalizeJson(left), canonicalizeJson(right));
  assert.equal(canonicalizeJson(left), '{"a":true,"z":{"alpha":1,"beta":2}}');
});

test("array order is preserved and shared non-cyclic values may repeat", () => {
  const shared = { b: 2, a: 1 };
  assert.equal(
    canonicalizeJson([3, 1, 2, shared, shared]),
    '[3,1,2,{"a":1,"b":2},{"a":1,"b":2}]',
  );
});

test("uses deterministic JSON escaping without escaping solidus", () => {
  const value = "\"\\\b\f\n\r\t\u0000\u001f/";
  assert.equal(canonicalizeJson(value), '"\\\"\\\\\\b\\f\\n\\r\\t\\u0000\\u001f/"');
});

test("sorts Unicode property names by UTF-16 code units", () => {
  const input = {
    "דּ": "Hebrew Letter Dalet With Dagesh",
    "1": "One",
    "😀": "Emoji",
    "€": "Euro Sign",
    "\r": "Carriage Return",
    "ö": "Latin Small Letter O With Diaeresis",
    "\u0080": "Control",
  };
  assert.equal(
    canonicalizeJson(input),
    '{"\\r":"Carriage Return","1":"One","":"Control","ö":"Latin Small Letter O With Diaeresis","€":"Euro Sign","😀":"Emoji","דּ":"Hebrew Letter Dalet With Dagesh"}',
  );
});

test("does not perform Unicode normalization", () => {
  const composed = "é";
  const decomposed = "e\u0301";
  const canonical = canonicalizeJson({ [composed]: composed, [decomposed]: decomposed });
  assert.equal(canonical, '{"é":"é","é":"é"}');
  assert.notEqual(new TextEncoder().encode(composed).length, new TextEncoder().encode(decomposed).length);
});

test("handles integers, floating point values, negative zero, and exponent edges", () => {
  assert.equal(
    canonicalizeJson([42, 4.50, -0, 1e20, 1e21, 1e-6, 1e-7]),
    '[42,4.5,0,100000000000000000000,1e+21,0.000001,1e-7]',
  );
});

test("preserves lexical G11 strings exactly", () => {
  const canonical = canonicalizeJson({ geometry: { G12: 0.02, G11: "1.11100" } });
  assert.equal(canonical, '{"geometry":{"G11":"1.11100","G12":0.02}}');
});

test("canonicalizeJsonBytes emits exact UTF-8", () => {
  const text = canonicalizeJson({ euro: "€", emoji: "😀" });
  assert.deepEqual(canonicalizeJsonBytes({ emoji: "😀", euro: "€" }), new TextEncoder().encode(text));
});

test("rejects every prohibited primitive or callable value", () => {
  const prohibited = [
    NaN,
    Infinity,
    -Infinity,
    undefined,
    () => 1,
    Symbol("x"),
    1n,
    { value: undefined },
    [undefined],
    { value: () => 1 },
    { value: Symbol("x") },
    { value: 1n },
  ];
  for (const value of prohibited) {
    assert.throws(() => canonicalizeJson(value), CanonicalJsonError);
  }
});

test("rejects sparse arrays and ambiguous array properties", () => {
  const sparse = new Array(2);
  sparse[1] = "present";
  assert.throws(() => canonicalizeJson(sparse), /sparse/);

  const extra = [1];
  extra.note = "not JSON array data";
  assert.throws(() => canonicalizeJson(extra), /non-index array property/);
});

test("rejects cyclic data", () => {
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => canonicalizeJson(cyclic), /cyclic/);
});

test("rejects class instances, Date, Map, Set, and custom toJSON methods", () => {
  class Example {
    constructor() { this.value = 1; }
  }
  const custom = { value: 1, toJSON() { return { value: 2 }; } };
  for (const value of [new Example(), new Date(0), new Map(), new Set(), custom]) {
    assert.throws(() => canonicalizeJson(value), CanonicalJsonError);
  }
});

test("rejects symbol-keyed properties", () => {
  const value = { visible: true };
  value[Symbol("hidden")] = 1;
  assert.throws(() => canonicalizeJson(value), /symbol-keyed/);
});

test("rejects lone Unicode surrogates in values and property names", () => {
  assert.throws(() => canonicalizeJson("\ud800"), /lone high Unicode surrogate/);
  assert.throws(() => canonicalizeJson("\udc00"), /lone low Unicode surrogate/);
  assert.throws(() => canonicalizeJson({ ["\ud800"]: "bad key" }), /property name/);
});
