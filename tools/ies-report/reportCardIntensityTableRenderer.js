import { validateIesReportCardContract } from "./reportCardContract.js";

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bandFor(value, peak) {
  const ratio = peak > 0 ? value / peak : 0;
  if (ratio >= 0.85) return "high";
  if (ratio >= 0.6) return "mid";
  return "low";
}

export function renderIntensityTableHtml(report) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) return "";

  const angles = report.photometry.horizontalAngles;
  const verticals = report.photometry.verticalAngles;
  const peak = report.metrics.peakCandela;
  const headerCells = angles.map((angle) => `<th>${safeText(angle)}°</th>`).join("");
  const rows = report.photometry.candelaMatrix.map((row, rowIndex) => {
    const cells = row.map((value) => `<td data-band="${bandFor(value, peak)}">${safeText(value.toFixed(1))}</td>`).join("");
    return `<tr><th>${safeText(verticals[rowIndex])}°</th>${cells}</tr>`;
  }).join("");

  return `<div class="ies-intensity-table-frame" data-rendered="report-json"><table class="ies-intensity-table" aria-label="Candela intensity table"><thead><tr><th>V°</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function summariseIntensityTable(report) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) return { ok: false, rowCount: 0, columnCount: 0, peakCandela: null };
  return {
    ok: true,
    rowCount: report.photometry.verticalAngles.length,
    columnCount: report.photometry.horizontalAngles.length,
    peakCandela: report.metrics.peakCandela
  };
}
