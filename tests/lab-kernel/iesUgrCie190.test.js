// Lab IES toolkit — CIE 190:2010 acceptance against the standard's own worked example (§5, Table 7 luminaire).
// Golden: 2H×4H, 70/50/20 → crosswise 11.0, endwise 13.1; Lb ≈ 8.71 cd/m². This exercises the embedded
// Tables 2–5, the zonal-flux chain, the glare-source n/a mask, and the C+90 endwise rule end-to-end.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeUgr190Table } from "../../packages/lab-kernel/ies-toolkit/iesUgrCie190.js";

// Table 7 (cd/1000 lm-lamp): rows γ = 0,5,…,90 ; cols C = 0,15,30,45,60,75,90 (disymmetric → quadrant fold covers the rest)
const T7 = [
  [264,264,264,264,264,264,264],[264,265,264,265,264,263,264],[258,257,258,260,262,261,260],
  [258,257,255,255,256,258,257],[242,244,246,249,249,251,250],[216,218,223,232,238,240,240],
  [193,194,197,208,222,231,232],[178,179,181,182,194,214,217],[158,160,162,167,171,189,204],
  [136,135,140,145,153,163,184],[114,115,118,123,130,143,152],[92,94,99,105,111,119,125],
  [72,73,77,86,92,99,101],[54,55,59,65,75,79,79],[44,44,43,47,55,61,60],
  [27,29,34,33,36,44,43],[22,21,20,18,21,25,25],[14,14,13,12,8,8,9],[5,5,4,3,1,0,0],
];
const V = []; for (let g = 0; g <= 90; g += 5) V.push(g);          // 19 γ angles
const Hc = [0,15,30,45,60,75,90];                                  // 7 C planes (quadrant)
const candela = Hc.map((_, ci) => T7.map((row) => row[ci]));       // candela[plane][γ]
const model = { photometry: { v_angles: V, h_angles: Hc, candela, geometry: { G7: 0.316, G8: 1.0, G9: 0 } } };

function cell(section, X, Y, reflIdx){
  const row = section.find((r) => r.X === X && r.Y === Y);
  return row.vals[reflIdx];
}

test("CIE 190 worked example — 2H×4H, 70/50/20 golden UGR (crosswise 11.0, endwise 13.1)", () => {
  const t = computeUgr190Table(model, { assumeCdPer1000Lamp: true });
  const cross = cell(t.crosswise, 2, 4, 0);   // reflIdx 0 = 70/50/20
  const end = cell(t.endwise, 2, 4, 0);
  assert.ok(Math.abs(cross - 11.0) <= 0.1, `crosswise ${cross.toFixed(2)} vs 11.0`);
  assert.ok(Math.abs(end - 13.1) <= 0.1, `endwise ${end.toFixed(2)} vs 13.1`);
  const lb = t.crosswise.find((r) => r.X === 2 && r.Y === 4).Lb[0];
  assert.ok(Math.abs(lb - 8.71) <= 0.1, `Lb ${lb} vs 8.71`);
});
