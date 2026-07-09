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
  const phi = trapz(row, Hr);
  const cov = azimuthCoverageDeg(H);
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

export function beamAngleFwhm(model){
  const P = model.photometry || {};
  const V = (P.v_angles || []).map(Number), H = (P.h_angles || []).map(Number), I = P.candela || [];
  if (!V.length || !H.length || !I.length) return { fwhmDeg: null, onHorizontalPlane: null };
  let j = 0, best = -Infinity;
  for (let h = 0; h < I.length; h++){ const m = Math.max(...I[h].map(Number)); if (m > best){ best = m; j = h; } }
  const line = I[j].map(Number);
  const peak = Math.max(...line);
  if (!(peak > 0)) return { fwhmDeg: null, onHorizontalPlane: H[j] };
  const half = 0.5 * peak;
  const k = line.indexOf(peak);
  let li = k; while (li > 0 && line[li] >= half) li--;
  let leftAng;
  if (line[li] >= half) leftAng = V[0];
  else { const x0 = line[li], x1 = line[li+1]; leftAng = (x1 !== x0) ? V[li] + (half - x0) * (V[li+1] - V[li]) / (x1 - x0) : V[li]; }
  let ri = k; while (ri < line.length - 1 && line[ri] >= half) ri++;
  let rightAng;
  if (line[ri] >= half) rightAng = V[V.length - 1];
  else { const x0 = line[ri-1], x1 = line[ri]; rightAng = (x1 !== x0) ? V[ri-1] + (half - x0) * (V[ri] - V[ri-1]) / (x1 - x0) : V[ri]; }
  return { fwhmDeg: rightAng - leftAng, onHorizontalPlane: H[j] };
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
