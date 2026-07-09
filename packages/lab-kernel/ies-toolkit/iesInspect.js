// Lab IES toolkit — viewer. Pure, browser-safe. Composes parse + metrics into a 3-section view.
// describeIes(model) -> structured { summary, metadata, headerValues, candelaTable, warnings }
// formatDescription(desc) -> plain text. Neither owns any maths; the summary comes from iesMetrics.
import { g } from "./iesShared.js";
import { computeMetrics } from "./iesMetrics.js";

const HEADER_FIELDS = [
  ["G0", "Number of lamps", 1],
  ["G1", "Lumens per lamp", -1],
  ["G2", "Candela multiplier", 1],
  ["G3", "Vertical angle count", 0],
  ["G4", "Horizontal angle count", 0],
  ["G5", "Photometric type", 1],
  ["G6", "Units", 2],
  ["G7", "Width (m)", 0],
  ["G8", "Length (m)", 0],
  ["G9", "Height (m)", 0],
  ["G10", "Ballast factor", 1],
  ["G11", "Ballast-lamp factor", 1],
  ["G12", "Input watts", 0],
];

function noteFor(gk, val){
  if (gk === "G1" && val === -1) return "absolute photometry (candela used as measured)";
  if (gk === "G2") return "baked in, so 1";
  if (gk === "G5" && val === 1) return "Type C";
  if (gk === "G6") return val === 2 ? "metres" : (val === 1 ? "feet" : "");
  return "";
}

export function describeIes(model){
  const P = model.photometry || {};
  const geom = P.geometry || {};
  const m = computeMetrics(model);
  const headerValues = HEADER_FIELDS.map(([gk, label, def]) => {
    const value = g(geom, gk, def);
    return { field: gk, label, value, note: noteFor(gk, value) };
  });
  const warnings = [];
  const hLen = (P.h_angles || []).length, vLen = (P.v_angles || []).length;
  if ((P.candela || []).length !== hLen) warnings.push("candela H-rows do not match horizontal angle count");
  if (((P.candela || [])[0] || []).length !== vLen) warnings.push("candela V-columns do not match vertical angle count");
  if (m.statedLumens != null && m.lumensMatch === false) warnings.push("computed lumens differs from the file's stated flux by more than 2%");
  if (!(m.watts > 0)) warnings.push("input watts is missing or zero (efficacy cannot be computed)");
  if (!(m.lengthM > 0)) warnings.push("length is missing or zero (lm/m cannot be computed)");
  return {
    summary: {
      totalLumens: m.lumens, statedLumens: m.statedLumens, lumensMatch: m.lumensMatch,
      watts: m.watts, lmPerW: m.lmPerW, lengthM: m.lengthM, lmPerM: m.lmPerM,
      symmetryFactor: m.symmetryFactor, azimuthCoverageDeg: m.azimuthCoverageDeg,
      peakCandela: m.peak.maxCandela, peakAtVertical: m.peak.atVertical, peakAtHorizontal: m.peak.atHorizontal,
      beamFwhmDeg: m.beam.fwhmDeg, beamOnHorizontalPlane: m.beam.onHorizontalPlane,
    },
    metadata: (model.meta?.keywords_order || []).map((r) => ({ key: r.key, value: String(r.value).trim() })),
    headerValues,
    candelaTable: {
      hPlaneCount: hLen, vAngleCount: vLen,
      hAngles: P.h_angles || [], vAngles: P.v_angles || [], grid: P.candela || [],
    },
    warnings,
  };
}

function n(x, d = 0){ return x == null ? "n/a" : Number(x).toFixed(d); }

export function formatDescription(desc){
  const s = desc.summary;
  const L = [];
  L.push("=== SUMMARY ===");
  L.push("  Total lumens : " + n(s.totalLumens, 0) + " lm"
    + (s.statedLumens != null ? "   (file states " + s.statedLumens + " lm - " + (s.lumensMatch ? "MATCH" : "DIFFERS") + ")" : "")
    + "   [symmetry x" + s.symmetryFactor + "]");
  L.push("  Power        : " + n(s.watts, 1) + " W");
  L.push("  Efficacy     : " + n(s.lmPerW, 1) + " lm/W");
  L.push("  Output/metre : " + n(s.lmPerM, 0) + " lm/m" + (s.lengthM ? "  (over " + s.lengthM + " m)" : ""));
  L.push("  Peak         : " + n(s.peakCandela, 0) + " cd  at V=" + s.peakAtVertical + " H=" + s.peakAtHorizontal);
  L.push("  Beam (FWHM)  : " + n(s.beamFwhmDeg, 1) + " deg  on H=" + s.beamOnHorizontalPlane + " plane");
  L.push("");
  L.push("=== 1. METADATA ===");
  for (const r of desc.metadata) L.push("  " + r.key + ": " + r.value);
  L.push("");
  L.push("=== 2. HEADER VALUES (plain English) ===");
  for (const h of desc.headerValues) L.push("  " + h.label.padEnd(24) + ": " + h.value + (h.note ? "   (" + h.note + ")" : ""));
  L.push("");
  L.push("=== 3. CANDELA TABLE (" + desc.candelaTable.hPlaneCount + " H-planes x " + desc.candelaTable.vAngleCount + " V-angles) ===");
  const vh = desc.candelaTable.vAngles.slice(0, 10).map((a) => String(a).padStart(8));
  L.push("  V-> " + vh.join(""));
  for (let h = 0; h < Math.min(3, desc.candelaTable.grid.length); h++){
    const vals = desc.candelaTable.grid[h].slice(0, 10).map((c) => Number(c).toFixed(1).padStart(8));
    L.push("  H=" + String(desc.candelaTable.hAngles[h]).padStart(4) + " " + vals.join(""));
  }
  if (desc.candelaTable.hPlaneCount > 3) L.push("  ... (" + (desc.candelaTable.hPlaneCount - 3) + " more H-planes)");
  if (desc.warnings.length){ L.push(""); L.push("=== WARNINGS ==="); for (const w of desc.warnings) L.push("  - " + w); }
  return L.join("\n");
}
