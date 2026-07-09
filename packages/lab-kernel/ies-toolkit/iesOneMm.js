// Lab IES toolkit — 1mm normalise. Ports scale_to_length_m / to_one_mm from lib/photometry/ies.py.
// Pure, browser-safe. Candela scales linearly with luminous length; this seeds the per-1mm reference.
export function scaleToLengthM(model, targetLengthM){
  if (!(targetLengthM > 0)) throw new Error("targetLengthM must be > 0");
  const w = JSON.parse(JSON.stringify(model));
  const phot = w.photometry || (w.photometry = {});
  const geom = phot.geometry || (phot.geometry = {});
  const baseLen = Number(geom.G8) || 0;
  if (baseLen <= 0){ geom.G8 = targetLengthM; return w; }
  const k = targetLengthM / baseLen;
  const grid = phot.candela || [];
  for (let h = 0; h < grid.length; h++) for (let v = 0; v < grid[h].length; v++) grid[h][v] = Number(grid[h][v]) * k;
  const watts = Number(geom.G12) || 0;
  if (watts > 0) geom.G12 = watts * k;
  geom.G8 = targetLengthM;
  return w;
}
export function toOneMm(model){ return scaleToLengthM(model, 0.001); }
