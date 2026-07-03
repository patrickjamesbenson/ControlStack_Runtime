import { validateIesReportCardContract } from "./reportCardContract.js";
import { renderIntensityTableHtml } from "./reportCardIntensityTableRenderer.js";
import { renderLinearPlotSvg, renderPolarPlotSvg } from "./reportCardSvgRenderer.js";

const THEME_CLASS = {
  "screen-dark": "theme-screen-dark",
  "datasheet-light": "theme-datasheet-light",
  "asset-transparent": "theme-asset-transparent"
};

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function themeClassFor(report, requestedTheme) {
  const theme = requestedTheme ?? report.defaultTheme;
  return THEME_CLASS[theme] ?? THEME_CLASS[report.defaultTheme] ?? THEME_CLASS["datasheet-light"];
}

function metric(value, suffix = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${value}${suffix}`;
}

function renderDetailsCard(report) {
  const luminous = report.dimensions.luminous;
  const physical = report.dimensions.physical;
  return `<article class="ies-report-card" data-card="details"><header class="ies-report-card-header"><h2 class="ies-report-card-title">Details</h2></header><div class="ies-report-card-body"><div class="ies-detail-meter" data-score="${safeText(report.metrics.lorPercent)}" aria-label="LOR percentage"></div><div class="ies-detail-layout"><div><dl class="ies-detail-list"><dt>Output</dt><dd>${safeText(metric(report.metrics.lumens, " lm"))}</dd><dt>Peak</dt><dd>${safeText(metric(report.metrics.peakCandela, " cd"))}</dd><dt>Power</dt><dd>${safeText(metric(report.metrics.watts, " W"))}</dd></dl><div class="ies-luminaire-mark" aria-label="Linear luminous aperture marker"></div><dl class="ies-detail-list"><dt>Luminous width</dt><dd>${safeText(metric(luminous.widthMm, " mm"))}</dd><dt>Luminous length</dt><dd>${safeText(metric(luminous.lengthMm, " mm"))}</dd><dt>Luminous height</dt><dd>${safeText(metric(luminous.heightMm, " mm"))}</dd><dt>Physical width</dt><dd>${safeText(metric(physical.widthMm, " mm"))}</dd><dt>Physical length</dt><dd>${safeText(metric(physical.lengthMm, " mm"))}</dd><dt>Physical height</dt><dd>${safeText(metric(physical.heightMm, " mm"))}</dd></dl></div><div class="ies-product-block"><div><span class="ies-product-label">Product name:</span><div class="ies-product-value">${safeText(report.product.name)}</div></div><div><span class="ies-product-label">Manufacturer:</span><div class="ies-product-value">${safeText(report.product.manufacturer)}</div></div><div><span class="ies-product-label">Catalogue code:</span><div class="ies-product-value">${safeText(report.product.catalogueCode)}</div></div><div><span class="ies-product-label">Lamp type:</span><div class="ies-product-value">${safeText(report.product.lampType)}</div></div><div><span class="ies-product-label">Symmetry:</span><div class="ies-product-value">${safeText(report.product.symmetry)}</div></div><div><span class="ies-product-label">Boundary:</span><div class="ies-product-value">Preview / report render only</div></div></div></div></div></article>`;
}

function renderPlotCard(title, cardName, svg, noteLeft, noteRight) {
  return `<article class="ies-report-card" data-card="${cardName}"><header class="ies-report-card-header"><h2 class="ies-report-card-title">${title}</h2></header><div class="ies-report-card-body"><div class="ies-plot-wrap">${svg}<div class="ies-legend" aria-label="${title} legend"><span class="ies-legend-line ies-legend-line--red"></span><span>C0/C180</span><span class="ies-legend-line ies-legend-line--blue"></span><span>C90/C270</span></div></div><p class="ies-plot-note"><span>${noteLeft}</span><span>${noteRight}</span></p></div></article>`;
}

function renderIntensityCard(report) {
  return `<article class="ies-report-card ies-report-card--wide" data-card="intensities"><header class="ies-report-card-header"><h2 class="ies-report-card-title">Intensities (candela)</h2></header>${renderIntensityTableHtml(report)}<footer class="ies-intensity-meta"><span>Rendered from report-card JSON contract.</span><span class="ies-export-size-note">Datasheet target: ${safeText(report.exportSizing.datasheetRowWidthMm)} mm report row, ${safeText(report.exportSizing.datasheetPlotWidthMm)} mm plot cards.</span></footer></article>`;
}

export function renderIesReportCardHtml(report, options = {}) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) return "";

  const themeClass = themeClassFor(report, options.theme);
  const cssHref = options.cssHref ?? "./photometric-report-card.css";
  const polarSvg = renderPolarPlotSvg(report);
  const linearSvg = renderLinearPlotSvg(report);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeText(report.product.name)} IES Report Card</title><link rel="stylesheet" href="${safeText(cssHref)}"></head><body class="${themeClass}" data-supported-themes="${safeText(report.supportedThemes.join(" "))}"><main class="ies-report-page" aria-label="Photometric report card"><header class="ies-report-header"><div><div class="ies-report-kicker">CoreStack photometric report</div><h1 class="ies-report-heading">${safeText(report.product.name)}</h1></div><div class="ies-report-safety-strip" aria-label="Safety posture"><span class="ies-report-chip">Preview only</span><span class="ies-report-chip">Report render only</span><span class="ies-report-chip">No IES generation</span><span class="ies-report-chip">No external fetch</span></div></header><section class="ies-report-grid" aria-label="IES report card grid">${renderDetailsCard(report)}${renderPlotCard("Polar plot", "polar-plot", polarSvg, `Beam angle: <strong>${safeText(report.metrics.beamAngleDegrees)}°</strong>`, `LOR: <strong>${safeText(report.metrics.lorPercent)}%</strong>`)}${renderPlotCard("Linear plot", "linear-plot", linearSvg, "Scale: <strong>candela</strong>", "Rendered JSON contract")}${renderIntensityCard(report)}</section></main></body></html>`;
}

export function summariseRenderedReportHtml(report, options = {}) {
  const html = renderIesReportCardHtml(report, options);
  return {
    ok: html.length > 0,
    byteLength: html.length,
    themeClass: html.match(/<body class="([^"]+)"/)?.[1] ?? null,
    includesDetails: html.includes('data-card="details"'),
    includesPolar: html.includes('data-card="polar-plot"'),
    includesLinear: html.includes('data-card="linear-plot"'),
    includesIntensities: html.includes('data-card="intensities"')
  };
}
