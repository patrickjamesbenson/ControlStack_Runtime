import { validateIesReportCardContract } from "./reportCardContract.js";

function ensureReport(report) {
  const check = validateIesReportCardContract(report);
  if (!check.ok) return check;
  return { ok: true, errors: [] };
}

function maxOf(values, fallback = 1) {
  const nums = values.filter((value) => Number.isFinite(value));
  const max = Math.max(...nums);
  return Number.isFinite(max) && max > 0 ? max : fallback;
}

function scaleMax(report) {
  return Math.ceil(maxOf([
    report.metrics.peakCandela,
    ...report.planes.c0c180.candela,
    ...report.planes.c90c270.candela
  ]) / 100) * 100;
}

function linearPath(angles, values, width, height, maxValue) {
  const padX = 36;
  const padY = 24;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;
  const maxAngle = maxOf(angles);
  return values.map((value, index) => {
    const x = padX + (angles[index] / maxAngle) * plotWidth;
    const y = padY + plotHeight - (value / maxValue) * plotHeight;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function polarPath(angles, values, width, height, maxValue) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;
  return values.map((value, index) => {
    const theta = (180 - angles[index]) * Math.PI / 180;
    const r = (value / maxValue) * radius;
    const x = cx + Math.sin(theta) * r;
    const y = cy + Math.cos(theta) * r;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function renderLinearPlotSvg(report, options = {}) {
  const check = ensureReport(report);
  if (!check.ok) return "";
  const width = options.width ?? report.exportSizing.screenPlotWidthPx ?? 360;
  const height = options.height ?? report.exportSizing.screenPlotHeightPx ?? 260;
  const maxValue = scaleMax(report);
  const angles = report.planes.c0c180.verticalAngles;
  const red = linearPath(angles, report.planes.c0c180.candela, width, height, maxValue);
  const blue = linearPath(angles, report.planes.c90c270.candela, width, height, maxValue);
  const fill = `${red} L${width - 36},${height - 24} L36,${height - 24} Z`;
  return `<svg class="ies-plot-svg" data-plot="linear" viewBox="0 0 ${width} ${height}" role="img" aria-label="Linear plot"><rect x="36" y="24" width="${width - 72}" height="${height - 48}" fill="none" class="ies-grid-line--strong"></rect><path class="ies-beam-fill" d="${fill}"></path><path class="ies-curve-red" d="${red}"></path><path class="ies-curve-blue" d="${blue}"></path><text class="ies-plot-label" x="${width - 82}" y="18">candela</text></svg>`;
}

export function renderPolarPlotSvg(report, options = {}) {
  const check = ensureReport(report);
  if (!check.ok) return "";
  const width = options.width ?? report.exportSizing.screenPlotWidthPx ?? 360;
  const height = options.height ?? report.exportSizing.screenPlotHeightPx ?? 260;
  const maxValue = scaleMax(report);
  const angles = report.planes.c0c180.verticalAngles;
  const red = polarPath(angles, report.planes.c0c180.candela, width, height, maxValue);
  const blue = polarPath(angles, report.planes.c90c270.candela, width, height, maxValue);
  const cx = width / 2;
  const cy = height / 2;
  const fill = `${red} L${cx},${cy} Z`;
  return `<svg class="ies-plot-svg" data-plot="polar" viewBox="0 0 ${width} ${height}" role="img" aria-label="Polar plot"><circle class="ies-grid-line" cx="${cx}" cy="${cy}" r="42"></circle><circle class="ies-grid-line" cx="${cx}" cy="${cy}" r="78"></circle><circle class="ies-grid-line--strong" cx="${cx}" cy="${cy}" r="112"></circle><line class="ies-axis-line" x1="${cx}" y1="12" x2="${cx}" y2="${height - 12}"></line><line class="ies-axis-line" x1="24" y1="${cy}" x2="${width - 24}" y2="${cy}"></line><path class="ies-beam-fill" d="${fill}"></path><path class="ies-curve-red" d="${red}"></path><path class="ies-curve-blue" d="${blue}"></path><text class="ies-plot-label" x="${cx - 8}" y="${height - 8}">0°</text></svg>`;
}
