// Lab IES toolkit — metrics/computations. Ports lib/photometry/metrics.py (donor). Pure, browser-safe.
// Flux (luminous_flux_with_factor), peak intensity, beam angle (FWHM), lm/W, lm/m.
function d2r(a){ return a * Math.PI / 180; }
function trapz(y, x){ let s = 0; for (let i = 0; i < x.length - 1; i++) s += 0.5 * (y[i] + y[i+1]) * (x[i+1] - x[i]); return s; }

function azimuthCoverageDeg(H){
  const h = [...new Set(H.map(x => ((x % 360) + 360) % 360))].sort((a, b) => a - b);
  if (h.length <= 1) return 0;
  const diffs = []; for (let i = 0; i < h.length - 1; i++) diffs.push(h[i+1] - h[i]);
  const wrap = (h[0] + 360) - h[h.length - 1];
  return 360 - Math.max(...diffs, wrap);
}
function replicationFromCoverage(cov){ if (cov <= 90 + 1e-6) return 4; if (cov <= 180 + 1e-6) return 2; return 1; }

export function luminousFlux(model){
  const P = model.photometry || {};
  const V = (P.v_angles || []).map(Number), H = (P.h_angles || []).map(Number), I = P.candela || [];
  if (!V.length || !H.length || !I.length) return { lumens: null, symmetryFactor: 1, azimuthCoverageDeg: 0 };
  const Vr = V.map(d2r), Hr = H.map(d2r), sV = Vr.map(Math.sin);
  const row = [];
  for (let h = 0; h < H.length; h++){ const yv = I[h].map((c, v) => Number(c) * sV[v]); row.push(trapz(yv, Vr)); }
  const cov = azimuthCoverageDeg(H);
  // A single stored plane is rotationally symmetric — integrate it over the full 2π azimuth.
  // (Integrating `row` over a one-point Hr with trapz would be 0, which is wrong.)
  if (H.length === 1) return { lumens: row[0] * 2 * Math.PI, symmetryFactor: 1, azimuthCoverageDeg: cov };
  const phi = trapz(row, Hr);
  const mul = replicationFromCoverage(cov);
  return { lumens: phi * mul, symmetryFactor: mul, azimuthCoverageDeg: cov };
}

export function peakIntensity(model){
  const P = model.photometry || {};
  const V = P.v_angles || [], H = P.h_angles || [], I = P.candela || [];
  let max = -Infinity, hi = 0, vi = 0;
  for (let h = 0; h < I.length; h++) for (let v = 0; v < I[h].length; v++){ const c = Number(I[h][v]); if (c > max){ max = c; hi = h; vi = v; } }
  if (!isFinite(max)) return { maxCandela: null, atVertical: null, atHorizontal: null };
  return { maxCandela: max, atVertical: V[vi] ?? null, atHorizontal: H[hi] ?? null };
}

// Full-width-half-max of a single plane's candela-vs-vertical-angle line. Nadir/zenith-aware: a symmetric beam is
// stored as a half-curve, so if it straddles the nadir (or zenith) the measured side is doubled to the full angle.
function fwhmForLine(V, line){
  const peak = Math.max(...line); if (!(peak > 0)) return null;
  const half = 0.5 * peak; const k = line.indexOf(peak);
  let li = k; while (li > 0 && line[li] >= half) li--;
  let leftAng;
  if (line[li] >= half) leftAng = V[0];
  else { const x0 = line[li], x1 = line[li+1]; leftAng = (x1 !== x0) ? V[li] + (half - x0) * (V[li+1] - V[li]) / (x1 - x0) : V[li]; }
  let ri = k; while (ri < line.length - 1 && line[ri] >= half) ri++;
  let rightAng;
  if (line[ri] >= half) rightAng = V[V.length - 1];
  else { const x0 = line[ri-1], x1 = line[ri]; rightAng = (x1 !== x0) ? V[ri-1] + (half - x0) * (V[ri] - V[ri-1]) / (x1 - x0) : V[ri]; }
  const nadirLit = line[0] >= half, zenithLit = line[line.length - 1] >= half;
  if (nadirLit && !zenithLit) return 2 * (rightAng - V[0]);
  if (zenithLit && !nadirLit) return 2 * (V[V.length - 1] - leftAng);
  return rightAng - leftAng;
}
// candela-vs-V for the stored plane nearest a requested C-plane (symmetry-folded so half-stored files resolve).
function planeLineFor(H, I, targetC){
  const Hmax = H.length ? Math.max(...H) : 0;
  const fold = (t) => { t = ((t % 360) + 360) % 360; if (Hmax <= 1) return 0; if (Hmax <= 91){ t = t > 180 ? 360 - t : t; return t > 90 ? 180 - t : t; } if (Hmax <= 181) return t > 180 ? 360 - t : t; return t; };
  const t = fold(targetC); let bi = 0, bd = Infinity;
  for (let h = 0; h < H.length; h++){ let d = Math.abs(((H[h] - t) % 360 + 360) % 360); d = Math.min(d, 360 - d); if (d < bd){ bd = d; bi = h; } }
  return (I[bi] || []).map(Number);
}
// Beam angle PER principal plane. An elliptical beam (e.g. 8°x45° grazer) needs two numbers, not one; a single
// "peak plane" pick lands on an ambiguous in-between value. Headline the narrower plane, as Viso does.
export function beamAngleFwhm(model){
  const P = model.photometry || {};
  const V = (P.v_angles || []).map(Number), H = (P.h_angles || []).map(Number), I = P.candela || [];
  if (!V.length || !H.length || !I.length) return { fwhmDeg: null, c0Deg: null, c90Deg: null, onHorizontalPlane: null };
  const c0 = fwhmForLine(V, planeLineFor(H, I, 0));
  const c90 = fwhmForLine(V, planeLineFor(H, I, 90));
  const vals = [c0, c90].filter((x) => x != null);
  const fwhmDeg = vals.length ? Math.min(...vals) : null;
  return { fwhmDeg, c0Deg: c0, c90Deg: c90, onHorizontalPlane: 0 };
}

export function lmPerW(lumens, watts){ return (watts > 0 && lumens != null) ? lumens / watts : null; }
export function lmPerM(lumens, lengthM){ return (lengthM > 0 && lumens != null) ? lumens / lengthM : null; }

export function statedLumens(model){
  for (const r of (model.meta?.keywords_order || [])){
    const k = String(r.key || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (k === "LUMINOUSFLUX" || k === "LUMFLUX" || k === "LUMENS"){
      const num = parseFloat(String(r.value).replace(/,/g, "").replace(/[^0-9.].*$/, "").trim());
      return isFinite(num) ? num : null;
    }
  }
  return null;
}

export function computeMetrics(model){
  const G = model.photometry?.geometry || {};
  const watts = Number(G.G12) || 0;
  const lengthM = Number(G.G8) || 0;
  const flux = luminousFlux(model);
  const stated = statedLumens(model);
  return {
    lumens: flux.lumens,
    statedLumens: stated,
    lumensMatch: (flux.lumens != null && stated != null) ? (Math.abs(flux.lumens - stated) / stated < 0.02) : null,
    symmetryFactor: flux.symmetryFactor,
    azimuthCoverageDeg: flux.azimuthCoverageDeg,
    watts, lengthM,
    lmPerW: lmPerW(flux.lumens, watts),
    lmPerM: lmPerM(flux.lumens, lengthM),
    peak: peakIntensity(model),
    beam: beamAngleFwhm(model),
  };
}
