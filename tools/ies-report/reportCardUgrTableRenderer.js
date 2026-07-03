import { validateIesReportCardContract } from "./reportCardContract.js";
import { createCandelaLookup } from "./reportCardAngularLookup.js";

export const UGR_ROOM_INDEXES = [0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5];

export const UGR_REFLECTANCE_SETS = [
  { key: "70-50-20", label: "70/50/20", ceiling: 70, wall: 50, floor: 20 },
  { key: "70-30-20", label: "70/30/20", ceiling: 70, wall: 30, floor: 20 },
  { key: "50-50-20", label: "50/50/20", ceiling: 50, wall: 50, floor: 20 },
  { key: "50-30-20", label: "50/30/20", ceiling: 50, wall: 30, floor: 20 },
  { key: "30-30-20", label: "30/30/20", ceiling: 30, wall: 30, floor: 20 }
];

export const UGR_VIEW_DIRECTIONS = [
  { key: "lengthwise", label: "Lengthwise", azimuth: 0, penalty: 0 },
  { key: "crosswise", label: "Crosswise", azimuth: 90, penalty: 1.4 }
];

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function luminousAreaM2(report) {
  const luminous = report.dimensions.luminous;
  const widthM = Math.max(luminous.widthMm, 1) / 1000;
  const lengthM = Math.max(luminous.lengthMm, 1) / 1000;
  return widthM * lengthM;
}

function reflectanceBenefit(reflectanceSet) {
  return (reflectanceSet.ceiling * 0.045) + (reflectanceSet.wall * 0.035) + (reflectanceSet.floor * 0.01);
}

function roomIndexAdjustment(roomIndex) {
  return 2.3 - Math.log10(roomIndex + 0.4) * 3.2;
}

function classifyUgr(value) {
  if (value <= 16) return "excellent";
  if (value <= 19) return "office";
  if (value <= 22) return "general";
  return "caution";
}

function estimateReferenceUgr(report, lookup, reflectanceSet, direction, roomIndex) {
  const source = lookup.lookup(direction.azimuth, 65);
  const area = luminousAreaM2(report);
  const candela = source?.candela ?? report.metrics.peakCandela;
  const intensityFactor = Math.log10(Math.max(candela, 1) / 900) * 4.2;
  const areaFactor = -Math.log10(Math.max(area, 0.001) / 0.055) * 2.6;
  const outputFactor = Math.log10(Math.max(report.metrics.lumens, 1) / 2500) * 1.2;
  const value = 18.4 + intensityFactor + areaFactor + outputFactor + direction.penalty + roomIndexAdjustment(roomIndex) - reflectanceBenefit(reflectanceSet);
  return Math.max(10, Math.min(35, Math.round(value)));
}

export function buildReferenceUgrTable(report) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      referenceEstimateOnly: true,
      rows: []
    };
  }

  const lookup = createCandelaLookup(report);
  if (!lookup.ok) {
    return {
      ok: false,
      errors: lookup.errors,
      referenceEstimateOnly: true,
      rows: []
    };
  }

  const rows = [];
  for (const reflectanceSet of UGR_REFLECTANCE_SETS) {
    for (const direction of UGR_VIEW_DIRECTIONS) {
      const values = UGR_ROOM_INDEXES.map((roomIndex) => estimateReferenceUgr(report, lookup, reflectanceSet, direction, roomIndex));
      rows.push({
        reflectance: reflectanceSet.label,
        reflectanceKey: reflectanceSet.key,
        direction: direction.label,
        directionKey: direction.key,
        values,
        bands: values.map(classifyUgr)
      });
    }
  }

  return {
    ok: true,
    errors: [],
    method: "reference-estimate-table",
    referenceEstimateOnly: true,
    certificationClaim: false,
    symmetryMode: lookup.symmetryMode,
    roomIndexes: UGR_ROOM_INDEXES,
    rows,
    notes: [
      "Reference UGR table layout and estimate only.",
      "Final compliant UGR claims require controlled CIE/standard method validation and project inputs.",
      "Symmetry-aware angular lookup resolves missing planes without modifying source IES data."
    ]
  };
}

export function renderReferenceUgrTableHtml(report) {
  const table = buildReferenceUgrTable(report);
  if (!table.ok) return "";

  const header = table.roomIndexes.map((roomIndex) => `<th>${safeText(roomIndex.toFixed(2).replace(/\.00$/, ""))}</th>`).join("");
  const rows = table.rows.map((row) => {
    const cells = row.values.map((value, index) => `<td data-ugr-band="${row.bands[index]}">${safeText(value)}</td>`).join("");
    return `<tr><th>${safeText(row.reflectance)}</th><th>${safeText(row.direction)}</th>${cells}</tr>`;
  }).join("");

  return `<div class="ies-ugr-table-frame" data-rendered="reference-ugr-estimate" data-symmetry-mode="${safeText(table.symmetryMode)}"><table class="ies-ugr-table" aria-label="Reference UGR table"><thead><tr><th>ρ c/w/f</th><th>Direction</th>${header}</tr></thead><tbody>${rows}</tbody></table><p class="ies-ugr-note">Reference estimate only. Not a certified UGR claim. Symmetry-aware lookup resolves missing source planes without changing the IES file.</p></div>`;
}

export function summariseReferenceUgrTable(report) {
  const table = buildReferenceUgrTable(report);
  return {
    ok: table.ok,
    method: table.method ?? null,
    referenceEstimateOnly: table.referenceEstimateOnly === true,
    certificationClaim: table.certificationClaim === true,
    rowCount: table.rows.length,
    columnCount: table.roomIndexes?.length ?? 0,
    symmetryMode: table.symmetryMode ?? null
  };
}
