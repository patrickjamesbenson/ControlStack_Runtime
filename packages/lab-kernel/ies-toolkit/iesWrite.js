// Lab IES toolkit — write. Ports lib/photometry/ies.py build_ies_text (donor). Pure, browser-safe.
import { ensureHxV, g, wrapNumbersPerLine } from "./iesShared.js";

export function writeIes(w) {
  const meta = w.meta || {};
  const phot = w.photometry || {};
  const geom = phot.geometry || {};
  let vAngles = (phot.v_angles || []).map(Number);
  let hAngles = (phot.h_angles || []).map(Number);
  const vCount = Math.trunc(g(geom, "G3", vAngles.length));
  const hCount = Math.trunc(g(geom, "G4", hAngles.length));
  vAngles = vAngles.slice(0, vCount);
  hAngles = hAngles.slice(0, hCount);
  const grid = ensureHxV(phot.candela || [], hCount, vCount);
  const G0 = Math.trunc(g(geom, "G0", 1)), G1 = g(geom, "G1", 1000), G2 = g(geom, "G2", 1);
  const G5 = Math.trunc(g(geom, "G5", 1)), G6 = Math.trunc(g(geom, "G6", 2));
  const G7 = g(geom, "G7", 0), G8 = g(geom, "G8", 0), G9 = g(geom, "G9", 0);
  const G10 = g(geom, "G10", 1), G11 = g(geom, "G11", 1), G12 = g(geom, "G12", 0);
  const lines = ["IESNA:LM-63-2002"];
  const emitted = new Set();
  const ordered = Array.isArray(meta.keywords_order) ? meta.keywords_order : [];
  for (const row of ordered) {
    if (!row || typeof row !== "object") continue;
    const key = String(row.key ?? "").trim();
    const value = String(row.value ?? "").trim();
    if (!key || !value) continue;
    const bareKey = key.replace(/^\[|\]$/g, "").toUpperCase();
    if (emitted.has(bareKey)) continue;
    lines.push("[" + bareKey + "] " + value);
    emitted.add(bareKey);
  }
  const kw = meta.keywords || {};
  if (kw && typeof kw === "object") {
    for (const [key, value] of Object.entries(kw)) {
      const bareKey = String(key ?? "").trim().replace(/^\[|\]$/g, "").toUpperCase();
      const textValue = String(value ?? "").trim();
      if (!bareKey || !textValue || emitted.has(bareKey)) continue;
      lines.push("[" + bareKey + "] " + textValue);
      emitted.add(bareKey);
    }
  }
  lines.push("TILT=NONE");
  const header10 = [G0, G1, G2, vCount, hCount, G5, G6, G7, G8, G9];
  lines.push(wrapNumbersPerLine(header10, header10.length)[0]);
  const header3 = [G10, G11, G12];
  lines.push(wrapNumbersPerLine(header3, header3.length)[0]);
  for (const l of wrapNumbersPerLine(vAngles)) lines.push(l);
  for (const l of wrapNumbersPerLine(hAngles)) lines.push(l);
  const flat = [];
  for (let h = 0; h < hCount; h++) for (const c of grid[h]) flat.push(c);
  for (const l of wrapNumbersPerLine(flat)) lines.push(l);
  return lines.join("\n") + "\n";
}
