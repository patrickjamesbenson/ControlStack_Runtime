// Lab/eng IES toolkit — rotate the azimuth of a distribution. Pure, browser-safe.
// Rotation is an azimuth SHIFT (not a mirror/reflection). Novon convention: rotate(X) turns the fixture so
// features shift by -X, i.e. 10deg of rotation reads from 360-10 = 350. Requires a FULL 0-360 distribution
// (you cannot rotate a half you don't have) -> fail-closed if not, then standardise to a uniform grid.
import { standardize } from "./iesTransforms.js";
import { isFullAzimuth } from "./iesGuards.js";

export function rotate(phot, degrees){
  if (!isFullAzimuth(phot)) throw new Error("rotate requires a full 0-360 azimuth distribution (expand symmetry first)");
  const p = standardize(phot);            // uniform 181 V x 25 H (0,15,...,360)
  const H = p.h_angles.map(Number);
  const V = p.v_angles;
  const core = H.length - 1;              // 24 unique azimuth planes (360 duplicates 0)
  const step = 360 / core;               // 15
  const I = p.candela;
  const deg = ((Number(degrees) % 360) + 360) % 360;
  const sample = (srcAz, vi) => {
    const idx = srcAz / step;
    const i0 = ((Math.floor(idx) % core) + core) % core;
    const i1 = (i0 + 1) % core;
    const frac = idx - Math.floor(idx);
    return Number(I[i0][vi]) * (1 - frac) + Number(I[i1][vi]) * frac;
  };
  const out = JSON.parse(JSON.stringify(p));
  out.candela = H.map((h) => V.map((_, vi) => sample(((h + deg) % 360 + 360) % 360, vi)));
  return out;
}
