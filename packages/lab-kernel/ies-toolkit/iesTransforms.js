// Lab/eng IES toolkit — data-mutation transforms (edit the candela numbers / geometry) + governed applyEdit.
// Ports from lib/photometry/ies.py, interp.py, metrics.py, ops.py. Pure, browser-safe.
// Every applyEdit logs a mutation (via provenance) and re-opens approval, so no transform slips past the stamp.
import { appendMutation } from "./iesProvenance.js";

function clonePhot(phot){ return JSON.parse(JSON.stringify(phot || {})); }
function interp(x, xp, fp){
  if (x <= xp[0]) return fp[0];
  const n = xp.length; if (x >= xp[n - 1]) return fp[n - 1];
  let i = 1; while (i < n && xp[i] < x) i++;
  const x0 = xp[i - 1], x1 = xp[i]; return fp[i - 1] + (x - x0) * (fp[i] - fp[i - 1]) / (x1 - x0);
}

// mirror_vertical_inplace: reverse each candela row
export function mirrorVertical(phot){ const p = clonePhot(phot); p.candela = (p.candela || []).map((r) => [...r].reverse()); return p; }
// apply_ies_multiplier_once: scale all candela by a factor
export function scaleByFactor(phot, k){ const p = clonePhot(phot); p.candela = (p.candela || []).map((r) => r.map((c) => Number(c) * Number(k))); return p; }

// _hemisphere: classify "down" | "up" | "bi" (10x dominance)
export function detectHemisphere(phot){
  const V = (phot.v_angles || []).map(Number); const I = phot.candela || [];
  if (!V.length || !I.length) return "bi";
  let i90 = 0, best = Infinity; for (let i = 0; i < V.length; i++){ const d = Math.abs(V[i] - 90); if (d < best){ best = d; i90 = i; } }
  let down = 0, up = 0;
  for (const row of I){ for (let i = 0; i <= i90; i++) down += Number(row[i]) || 0; for (let i = i90; i < V.length; i++) up += Number(row[i]) || 0; }
  if (down > 10 * up) return "down"; if (up > 10 * down) return "up"; return "bi";
}
// _apply_hemisphere_mask: zero the opposite hemisphere
export function maskHemisphere(phot, hemi = "auto"){
  const p = clonePhot(phot); const V = (p.v_angles || []).map(Number); const I = p.candela || [];
  const which = hemi === "auto" ? detectHemisphere(p) : hemi;
  if (which === "bi" || !V.length || !I.length) return p;
  let i90 = 0, best = Infinity; for (let i = 0; i < V.length; i++){ const d = Math.abs(V[i] - 90); if (d < best){ best = d; i90 = i; } }
  if (which === "down"){ for (const row of I) for (let i = i90 + 1; i < V.length; i++) row[i] = 0; }
  else if (which === "up"){ for (const row of I) for (let i = 0; i < i90; i++) row[i] = 0; }
  return p;
}
// flip_distribution: reverse V and/or H (grid + angle arrays)
export function flip(phot, { vertical = true, horizontal = false } = {}){
  const p = clonePhot(phot);
  let V = (p.v_angles || []).map(Number), H = (p.h_angles || []).map(Number), I = (p.candela || []).map((r) => r.map(Number));
  if (vertical){ I = I.map((r) => [...r].reverse()); V = [...V].reverse(); }
  if (horizontal){ I = [...I].reverse(); H = [...H].reverse(); }
  p.v_angles = V; p.h_angles = H; p.candela = I; return p;
}
// merge_photometry: sum two matching grids (standardise both first if they differ)
export function mergePhotometry(basePhot, addonPhot, method = "sum"){
  if (method !== "sum") throw new Error("Unsupported merge method");
  const p = clonePhot(basePhot);
  const Vb = p.v_angles || [], Hb = p.h_angles || [], Va = addonPhot.v_angles || [], Ha = addonPhot.h_angles || [];
  if (Vb.length !== Va.length || Hb.length !== Ha.length) throw new Error("V/H grids do not match; standardise both before merge");
  const Ib = (p.candela || []).map((r) => r.map(Number)), Ia = (addonPhot.candela || []).map((r) => r.map(Number));
  for (let h = 0; h < Ib.length; h++) for (let v = 0; v < Ib[h].length; v++) Ib[h][v] += Number(Ia[h][v]);
  p.candela = Ib; return p;
}
// resample_to_grid: separable linear resample onto new V/H (this is also "pad"/standardise)
export function resampleToGrid(phot, newV, newH){
  const p = clonePhot(phot);
  const V = (p.v_angles || []).map(Number), H = (p.h_angles || []).map(Number), I = p.candela || [];
  if (!V.length || !H.length || !I.length) return p;
  const V2 = (newV || V).map(Number), H2 = (newH || H).map(Number);
  const I1 = I.map((row) => V2.map((v) => interp(v, V, row.map(Number))));
  const I2 = H2.map((h) => V2.map((_, c) => interp(h, H, I1.map((r) => r[c]))));
  p.v_angles = V2; p.h_angles = H2; p.candela = I2; return p;
}
// standardise onto the canonical 181 (0..180) x 25 (0..360/15) grid
export function standardize(phot){
  const V = Array.from({ length: 181 }, (_, i) => i);
  const H = []; for (let h = 0; h <= 360; h += 15) H.push(h);
  return resampleToGrid(phot, V, H);
}
// apply_bclt_dimensions: set width/length/height (G7/G8/G9)
export function setDimensions(phot, { g7, g8, g9 } = {}){
  const p = clonePhot(phot); const G = p.geometry || (p.geometry = {});
  if (g7 != null) G.G7 = Number(g7); if (g8 != null) G.G8 = Number(g8); if (g9 != null) G.G9 = Number(g9);
  return p;
}
// header flags: photometric type (G5), units (G6), candela multiplier (G2) — or a raw G-code
const FLAG_KEYS = { photometric_type: "G5", units: "G6", multiplier: "G2" };
export function setFlag(phot, flag, value){
  const p = clonePhot(phot); const G = p.geometry || (p.geometry = {});
  G[FLAG_KEYS[flag] || flag] = Number(value); return p;
}

// Governed edit: set the new photometry on the record and log the mutation (re-opens approval).
// Usage: applyEdit(record, mirrorVertical(record.photometry), { toolId: "ies-mirror", operation: "mirror-vertical" });
export function applyEdit(record, newPhotometry, { toolId, operation, paramsSummary = {}, actorType = "human_approved_tool_run" }){
  record.photometry = newPhotometry;
  appendMutation(record, { toolId, operation, paramsSummary, actorType });
  return record;
}
