// Lab IES toolkit — sequencing guards + recipes (the "control brief").
// The transforms are sharp tools: safe individually, dangerous out of order. These enforce preconditions
// (a tool refuses unless its inputs are ready) and encode the safe sequence once, as named recipes.
// The runtime/UI should call recipes, never raw transforms out of sequence.
import { standardize, maskHemisphere, mergePhotometry } from "./iesTransforms.js";

export function isFullAzimuth(phot, tol = 1){
  const H = (phot.h_angles || []).map(Number);
  return H.length > 1 && Math.abs(H[H.length - 1] - 360) < tol;
}
export function gridMatches(a, b){
  return (a.v_angles?.length === b.v_angles?.length) && (a.h_angles?.length === b.h_angles?.length);
}
export function mergeBlockers(a, b){
  const out = [];
  if (!isFullAzimuth(a)) out.push("base is not full 0-360 azimuth (standardise first)");
  if (!isFullAzimuth(b)) out.push("addon is not full 0-360 azimuth (standardise first)");
  if (!gridMatches(a, b)) out.push("grids differ (interpolate both to the same angle count first)");
  return out;
}
export function assertMergeable(a, b){ const bl = mergeBlockers(a, b); if (bl.length) throw new Error("cannot merge: " + bl.join("; ")); }

// RECIPE — merge two optics safely: standardise -> mask the dark hemisphere the interpolation lit -> check -> merge.
// (flip is independent; the caller flips first if an uplight mirror is wanted.)
export function mergeOptics(base, addon, { maskBase = "auto", maskAddon = "auto" } = {}){
  const b1 = maskHemisphere(standardize(base), maskBase);
  const a1 = maskHemisphere(standardize(addon), maskAddon);
  assertMergeable(b1, a1);
  return mergePhotometry(b1, a1, "sum");
}
