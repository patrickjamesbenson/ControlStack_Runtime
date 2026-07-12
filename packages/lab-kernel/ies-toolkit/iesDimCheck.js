// Lab IES toolkit - luminous-dimension orientation check + reposition. Pure, browser-safe.
// Physical L/W/H is the carton, not the luminous opening. A test rig sometimes writes WIDTH where
// LENGTH belongs (common with linear fittings). If a normalised file reads wider than it is long,
// that is almost always a G7<->G8 transposition. This is a GEOMETRY reposition only - candela unchanged.
export function checkDimensions(model, tol = 1e-6) {
  const G = model.photometry?.geometry || {};
  const width  = Math.abs(Number(G.G7)) || 0;   // G7 = width  (across the luminous opening)
  const length = Math.abs(Number(G.G8)) || 0;   // G8 = length (along the luminous opening)
  const height = Math.abs(Number(G.G9)) || 0;   // G9 = height
  const transposedLikely = length > 0 && width > 0 && width > length + tol;
  return {
    widthM: width, lengthM: length, heightM: height, transposedLikely,
    ratio: length > 0 ? +(width / length).toFixed(3) : null,
    note: transposedLikely
      ? "Width > length: likely L/W transposed in the test file. Reposition G7<->G8 (no candela change)."
      : "Length >= width: dimensions look correctly oriented.",
  };
}
export function fixDimensionTranspose(model, reason = "width>length; test likely wrote width where length belongs") {
  const out = JSON.parse(JSON.stringify(model));
  const g = out.photometry.geometry || (out.photometry.geometry = {});
  const w = Number(g.G7) || 0, l = Number(g.G8) || 0;
  g.G7 = l; g.G8 = w;                 // swap width/length; height (G9) untouched; candela untouched
  out.meta = out.meta || {};
  out.meta.notes = out.meta.notes || [];
  out.meta.notes.push("Dimension reposition (G7<->G8): " + reason);
  return { model: out, from: { G7: w, G8: l }, to: { G7: l, G8: w }, reason };
}
