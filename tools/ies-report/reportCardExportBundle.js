import { validateIesReportCardContract } from "./reportCardContract.js";
import { renderIesReportCardHtml } from "./reportCardHtmlRenderer.js";
import { renderIntensityTableHtml } from "./reportCardIntensityTableRenderer.js";
import { renderLinearPlotSvg, renderPolarPlotSvg } from "./reportCardSvgRenderer.js";

const SAFE_BASENAME_PATTERN = /[^a-z0-9._-]+/gi;

function safeBasename(value) {
  const text = String(value ?? "ies-report-card")
    .trim()
    .replace(SAFE_BASENAME_PATTERN, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return text || "ies-report-card";
}

function buildEntry(relativePath, mediaType, content, description) {
  return {
    relativePath,
    mediaType,
    description,
    byteLength: content.length,
    content
  };
}

export function buildIesReportCardExportBundle(report, options = {}) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      writeToDisk: false,
      entries: []
    };
  }

  const basename = safeBasename(options.basename ?? report.product.catalogueCode ?? report.product.name);
  const theme = options.theme ?? report.defaultTheme;
  const html = renderIesReportCardHtml(report, { theme, cssHref: options.cssHref ?? "./photometric-report-card.css" });
  const polarSvg = renderPolarPlotSvg(report);
  const linearSvg = renderLinearPlotSvg(report);
  const intensityHtml = renderIntensityTableHtml(report);

  return {
    ok: true,
    errors: [],
    writeToDisk: false,
    theme,
    basename,
    entries: [
      buildEntry(`${basename}.report.html`, "text/html", html, "Full report card HTML"),
      buildEntry(`${basename}.polar.svg`, "image/svg+xml", polarSvg, "Polar plot SVG"),
      buildEntry(`${basename}.linear.svg`, "image/svg+xml", linearSvg, "Linear plot SVG"),
      buildEntry(`${basename}.intensities.html`, "text/html", intensityHtml, "Intensity table HTML fragment")
    ],
    safetyBoundary: {
      previewOnly: true,
      reportRenderOnly: true,
      filesystemWritePerformed: false,
      iesWrite: false,
      runtimeDataWrite: false,
      externalFetch: false,
      postEndpoint: false
    }
  };
}

export function summariseIesReportCardExportBundle(report, options = {}) {
  const bundle = buildIesReportCardExportBundle(report, options);
  return {
    ok: bundle.ok,
    entryCount: bundle.entries.length,
    relativePaths: bundle.entries.map((entry) => entry.relativePath),
    mediaTypes: bundle.entries.map((entry) => entry.mediaType),
    writeToDisk: bundle.writeToDisk,
    filesystemWritePerformed: bundle.safetyBoundary?.filesystemWritePerformed === true,
    iesWrite: bundle.safetyBoundary?.iesWrite === true,
    runtimeDataWrite: bundle.safetyBoundary?.runtimeDataWrite === true,
    externalFetch: bundle.safetyBoundary?.externalFetch === true
  };
}
