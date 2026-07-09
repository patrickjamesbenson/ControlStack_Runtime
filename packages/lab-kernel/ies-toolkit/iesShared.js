// Shared LM-63 helpers for the lab IES toolkit. Pure, browser-safe (no node:* imports).
// Ported from lib/photometry/ies.py (donor).
export const GEOM_G_MAP = {
  num_lamps: "G0", lumens_per_lamp: "G1", candela_multiplier: "G2",
  v_count: "G3", h_count: "G4", photometric_type: "G5", units_type: "G6",
  width: "G7", length: "G8", height: "G9",
  ballast_factor: "G10", ballast_lamp_photometric_factor: "G11", input_watts: "G12",
};

export function num(v) { const f = Number(v); return Number.isFinite(f) ? f : 0; }

export function g(geom, key, def) {
  const has = geom && Object.prototype.hasOwnProperty.call(geom, key);
  const f = Number(has ? geom[key] : def);
  return Number.isFinite(f) ? f : def;
}

export function ensureHxV(grid, hCount, vCount) {
  if (Array.isArray(grid) && grid.length && Array.isArray(grid[0])) {
    const out = [];
    for (const row of grid.slice(0, hCount)) {
      const r = row.slice(0, vCount).map(Number);
      while (r.length < vCount) r.push(0);
      out.push(r);
    }
    while (out.length < hCount) out.push(new Array(vCount).fill(0));
    return out;
  }
  if (Array.isArray(grid) && grid.length && !Array.isArray(grid[0])) {
    const flat = grid.map(Number);
    const need = Math.max(0, hCount * vCount - flat.length);
    for (let k = 0; k < need; k++) flat.push(0);
    const out = []; let idx = 0;
    for (let h = 0; h < hCount; h++) { out.push(flat.slice(idx, idx + vCount)); idx += vCount; }
    return out;
  }
  const out = [];
  for (let h = 0; h < hCount; h++) out.push(new Array(vCount).fill(0));
  return out;
}

export function formatNumber(n) {
  const f = Number(n);
  if (Number.isInteger(f)) return String(f);
  return String(parseFloat(f.toPrecision(6)));
}

export function wrapNumbersPerLine(nums, per = 10) {
  const s = []; let row = [];
  for (const n of nums) {
    row.push(formatNumber(n));
    if (row.length >= per) { s.push(row.join(" ")); row = []; }
  }
  if (row.length) s.push(row.join(" "));
  return s;
}
