import { test } from "node:test";
import assert from "node:assert/strict";
import { level, detectTilt } from "../../packages/lab-kernel/ies-toolkit/iesLevel.js";
function dirFromCG(C,g){ const gr=g*Math.PI/180,cr=C*Math.PI/180; return [Math.sin(gr)*Math.cos(cr), Math.sin(gr)*Math.sin(cr), Math.cos(gr)]; }
// synthetic distribution peaked along axis (aC,aG): I = 100*max(0,cos(angle))^4
function field(aC,aG){
  const a=dirFromCG(aC,aG);
  const H=[]; for(let c=0;c<360;c+=15) H.push(c);
  const V=[]; for(let g=0;g<=90;g+=5) V.push(g);
  const candela=H.map(C=>V.map(g=>{ const d=dirFromCG(C,g); const dot=a[0]*d[0]+a[1]*d[1]+a[2]*d[2]; return 100*Math.pow(Math.max(0,dot),4); }));
  return { photometry:{ v_angles:V, h_angles:H, candela, geometry:{G7:0.1,G8:1.0,G9:0} } };
}
function argmaxGamma(P){ let mx=-Infinity,pg=0; for(let h=0;h<P.candela.length;h++) for(let v=0;v<P.candela[h].length;v++){ if(P.candela[h][v]>mx){mx=P.candela[h][v];pg=P.v_angles[v];} } return pg; }
test("detects a known 10 deg tilt", () => {
  const d = detectTilt(field(0,10));
  assert.ok(Math.abs(d.tiltDeg - 10) <= 2.5, `tilt ${d.tiltDeg} vs 10`);
});
test("levels a single-plane 10 deg tilt back to nadir", () => {
  const r = level(field(0,10));
  assert.ok(argmaxGamma(r.model.photometry) <= 5, `peak gamma ${argmaxGamma(r.model.photometry)} after level`);
  assert.ok(Math.abs(r.tiltDeg - 10) <= 2.5, `reported tilt ${r.tiltDeg}`);
});
test("levels a TWO-plane tilt (C45, 10 deg) back to nadir", () => {
  const r = level(field(45,10));
  assert.ok(argmaxGamma(r.model.photometry) <= 5, `peak gamma ${argmaxGamma(r.model.photometry)} after level`);
});
test("already-level field is a near no-op", () => {
  const r = level(field(0,0));
  assert.ok(argmaxGamma(r.model.photometry) <= 5);
  assert.equal(r.applied, false);
});
