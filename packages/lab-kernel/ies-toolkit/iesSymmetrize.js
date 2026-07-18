// Lab IES toolkit — symmetrize. Enforce the luminaire's intended azimuth symmetry on MEASURED data, and
// RECORD how asymmetric the raw data was, so measurement noise can be told from a genuinely asymmetric fixture.
// Symmetrize only when the asymmetry is noise; a large imbalance is a flag, not something to quietly erase.
// Pure, browser-safe. Applying it to a record is a governed mutation (logged, re-opens approval).
import { appendMutation } from "./iesProvenance.js";

function clone(p){ return JSON.parse(JSON.stringify(p || {})); }
function norm(a){ return ((a % 360) + 360) % 360; }

// nearest stored plane index to a horizontal angle
function planeIndex(H, target){
  const t = norm(target); let bi = 0, bd = Infinity;
  for (let h = 0; h < H.length; h++){ let d = Math.abs(norm(H[h]) - t); d = Math.min(d, 360 - d); if (d < bd){ bd = d; bi = h; } }
  return bi;
}
// symmetric partner azimuth for a mode
function partnerAngle(mode, hAng){
  if (mode === "mirror-c0") return norm(360 - hAng);   // reflect about the C0-C180 plane (left/right)
  if (mode === "mirror-c90") return norm(180 - hAng);  // reflect about the C90-C270 plane (front/back)
  return hAng;
}
// how far the planes deviate from their common average (0 = perfectly rotational)
function rotationalSpread(I){
  const nH = I.length, nV = I[0]?.length || 0; if (nH < 2 || !nV) return 0;
  const avg = new Array(nV).fill(0);
  for (const row of I) for (let v = 0; v < nV; v++) avg[v] += Number(row[v]) / nH;
  let peak = 0, mx = 0;
  for (const row of I) for (const c of row) peak = Math.max(peak, Number(c));
  for (const row of I) for (let v = 0; v < nV; v++) mx = Math.max(mx, Math.abs(Number(row[v]) - avg[v]));
  return peak > 0 ? mx / peak : 0;
}

// Inspect the file and recommend the symmetry it *should* have (never mutates).
export function analyzeSymmetry(model){
  const P = model.photometry || {};
  const H = (P.h_angles || []).map(Number);
  const I = (P.candela || []).map((r) => r.map(Number));
  const nH = H.length, span = nH ? Math.max(...H) - Math.min(...H) : 0;
  const rot = rotationalSpread(I);
  let recommended;
  if (nH <= 1) recommended = "rotational-trivial";       // one stored plane, already symmetric
  else if (rot < 0.02) recommended = "rotational";       // planes ~identical -> average them clean
  else if (span >= 270) recommended = "mirror-c0";       // full 0-360 stored -> can fold to a mirror
  else recommended = "already-folded";                   // stored as a symmetric subset -> nothing to do
  return { planes: nH, azimuthSpanDeg: span, rotationalSpreadPct: +(rot * 100).toFixed(2), recommended };
}

// Enforce symmetry by replacing each plane with the average of it and its symmetric partner (pure; returns new photometry + imbalance).
export function symmetrize(model, mode = "auto"){
  const P = clone(model.photometry);
  const H = (P.h_angles || []).map(Number);
  const I = (P.candela || []).map((r) => r.map(Number));
  if (mode === "auto") mode = analyzeSymmetry(model).recommended;
  const nH = H.length, nV = I[0]?.length || 0;
  let peak = 0; for (const row of I) for (const c of row) peak = Math.max(peak, c);
  const out = I.map((r) => r.slice());
  if (mode === "rotational" || mode === "rotational-trivial"){
    const avg = new Array(nV).fill(0);
    for (const row of I) for (let v = 0; v < nV; v++) avg[v] += row[v] / nH;
    for (let h = 0; h < nH; h++) for (let v = 0; v < nV; v++) out[h][v] = avg[v];
  } else if (mode === "mirror-c0" || mode === "mirror-c90"){
    for (let h = 0; h < nH; h++){ const pj = planeIndex(H, partnerAngle(mode, H[h])); for (let v = 0; v < nV; v++) out[h][v] = 0.5 * (I[h][v] + I[pj][v]); }
  } else if (mode === "quadrant"){
    for (let h = 0; h < nH; h++){ const a = H[h]; const idxs = [planeIndex(H, a), planeIndex(H, norm(360 - a)), planeIndex(H, norm(180 - a)), planeIndex(H, norm(180 + a))];
      for (let v = 0; v < nV; v++){ let s = 0; for (const j of idxs) s += I[j][v]; out[h][v] = s / idxs.length; } }
  } // "already-folded" / "none": no-op
  // imbalance = how much the data had to move to become symmetric, as a % of peak (this IS the recorded asymmetry)
  let mx = 0, ss = 0, n = 0;
  for (let h = 0; h < nH; h++) for (let v = 0; v < nV; v++){ const d = Math.abs(I[h][v] - out[h][v]); mx = Math.max(mx, d); ss += d * d; n++; }
  const imbalance = {
    mode,
    maxRelPct: +(peak > 0 ? 100 * mx / peak : 0).toFixed(2),
    rmsRelPct: +(peak > 0 && n ? 100 * Math.sqrt(ss / n) / peak : 0).toFixed(2),
  };
  P.candela = out;
  return { photometry: P, imbalance };
}

// Governed: symmetrize a record, stamp the imbalance onto it, log the mutation, re-open approval.
// large = imbalance above this % of peak is flagged as "may be a genuinely asymmetric fixture — don't erase it".
export function symmetrizeRecord(record, mode = "auto", largePct = 5){
  const res = symmetrize({ photometry: record.photometry }, mode);
  record.photometry = res.photometry;
  record.symmetry = {
    applied: true,
    mode: res.imbalance.mode,
    imbalanceMaxPct: res.imbalance.maxRelPct,
    imbalanceRmsPct: res.imbalance.rmsRelPct,
    flaggedLarge: res.imbalance.maxRelPct > largePct,
    atUtc: new Date().toISOString(),
  };
  appendMutation(record, {
    toolId: "lab-symmetrize", operation: "symmetrize",
    paramsSummary: { mode: res.imbalance.mode, imbalanceMaxPct: res.imbalance.maxRelPct, imbalanceRmsPct: res.imbalance.rmsRelPct },
  });
  return { record, imbalance: res.imbalance, flaggedLarge: record.symmetry.flaggedLarge };
}
