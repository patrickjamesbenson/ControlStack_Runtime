const REQUIRED_TOP_LEVEL_FIELDS = [
  "schemaVersion",
  "reportKind",
  "defaultTheme",
  "supportedThemes",
  "source",
  "safetyBoundary",
  "product",
  "metrics",
  "dimensions",
  "photometry",
  "planes",
  "exportSizing",
  "displayCards"
];

const REQUIRED_DISPLAY_CARDS = ["details", "polar-plot", "linear-plot", "intensities"];
const REQUIRED_THEMES = ["screen-dark", "datasheet-light", "asset-transparent"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumberArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isFiniteNumber);
}

function assertBoolean(report, path, expected, errors) {
  const parts = path.split(".");
  let current = report;
  for (const part of parts) current = current?.[part];
  if (current !== expected) errors.push(`${path} must be ${expected}`);
}

function assertRequiredFields(report, errors) {
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in report)) errors.push(`missing required top-level field: ${field}`);
  }
}

function assertThemes(report, errors) {
  if (report.defaultTheme !== "datasheet-light") errors.push("defaultTheme must be datasheet-light");
  if (!Array.isArray(report.supportedThemes)) {
    errors.push("supportedThemes must be an array");
    return;
  }
  for (const theme of REQUIRED_THEMES) {
    if (!report.supportedThemes.includes(theme)) errors.push(`missing supported theme: ${theme}`);
  }
}

function assertSafetyBoundary(report, errors) {
  if (!isPlainObject(report.safetyBoundary)) {
    errors.push("safetyBoundary must be present");
    return;
  }
  assertBoolean(report, "safetyBoundary.previewOnly", true, errors);
  assertBoolean(report, "safetyBoundary.reportRenderOnly", true, errors);
  assertBoolean(report, "safetyBoundary.iesWrite", false, errors);
  assertBoolean(report, "safetyBoundary.runtimeDataWrite", false, errors);
  assertBoolean(report, "safetyBoundary.donorEngineCall", false, errors);
  assertBoolean(report, "safetyBoundary.externalFetch", false, errors);
  assertBoolean(report, "safetyBoundary.postEndpoint", false, errors);
  assertBoolean(report, "safetyBoundary.productionPhotometry", false, errors);
  assertBoolean(report, "source.externalFetchRequired", false, errors);
  assertBoolean(report, "source.photometricEditorDependency", false, errors);
}

function assertProductAndMetrics(report, errors) {
  if (!isNonEmptyString(report.product?.name)) errors.push("product.name is required");
  if (!isNonEmptyString(report.product?.manufacturer)) errors.push("product.manufacturer is required");
  if (!isFiniteNumber(report.metrics?.lumens)) errors.push("metrics.lumens must be numeric");
  if (!isFiniteNumber(report.metrics?.watts)) errors.push("metrics.watts must be numeric");
  if (!isFiniteNumber(report.metrics?.peakCandela)) errors.push("metrics.peakCandela must be numeric");
}

function assertDimensions(report, errors) {
  for (const group of ["luminous", "physical"]) {
    const dimensions = report.dimensions?.[group];
    if (!isPlainObject(dimensions)) {
      errors.push(`dimensions.${group} must be present`);
      continue;
    }
    for (const field of ["widthMm", "lengthMm", "heightMm"]) {
      if (!isFiniteNumber(dimensions[field])) errors.push(`dimensions.${group}.${field} must be numeric`);
    }
  }
}

function assertPhotometry(report, errors) {
  const photometry = report.photometry;
  if (!isPlainObject(photometry)) {
    errors.push("photometry must be present");
    return;
  }
  const { verticalAngles, horizontalAngles, candelaMatrix } = photometry;
  if (!isNumberArray(verticalAngles)) errors.push("photometry.verticalAngles must be numeric");
  if (!isNumberArray(horizontalAngles)) errors.push("photometry.horizontalAngles must be numeric");
  if (!Array.isArray(candelaMatrix) || candelaMatrix.length === 0) {
    errors.push("photometry.candelaMatrix must be a non-empty matrix");
    return;
  }
  if (Array.isArray(verticalAngles) && candelaMatrix.length !== verticalAngles.length) {
    errors.push("photometry.candelaMatrix row count must match verticalAngles length");
  }
  candelaMatrix.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== horizontalAngles?.length || !row.every(isFiniteNumber)) {
      errors.push(`photometry.candelaMatrix row ${index} is invalid`);
    }
  });
}

function assertPlanes(report, errors) {
  for (const key of ["c0c180", "c90c270"]) {
    const plane = report.planes?.[key];
    if (!isPlainObject(plane)) {
      errors.push(`planes.${key} must be present`);
      continue;
    }
    if (!isNonEmptyString(plane.label)) errors.push(`planes.${key}.label is required`);
    if (!isNumberArray(plane.verticalAngles)) errors.push(`planes.${key}.verticalAngles must be numeric`);
    if (!isNumberArray(plane.candela)) errors.push(`planes.${key}.candela must be numeric`);
    if (Array.isArray(plane.verticalAngles) && Array.isArray(plane.candela) && plane.verticalAngles.length !== plane.candela.length) {
      errors.push(`planes.${key}.verticalAngles and candela lengths must match`);
    }
  }
}

function assertDisplayCards(report, errors) {
  if (!Array.isArray(report.displayCards)) {
    errors.push("displayCards must be an array");
    return;
  }
  for (const card of REQUIRED_DISPLAY_CARDS) {
    if (!report.displayCards.includes(card)) errors.push(`missing display card: ${card}`);
  }
}

export function validateIesReportCardContract(report) {
  const errors = [];
  if (!isPlainObject(report)) return { ok: false, errors: ["report must be an object"] };
  assertRequiredFields(report, errors);
  assertThemes(report, errors);
  assertSafetyBoundary(report, errors);
  assertProductAndMetrics(report, errors);
  assertDimensions(report, errors);
  assertPhotometry(report, errors);
  assertPlanes(report, errors);
  assertDisplayCards(report, errors);
  return { ok: errors.length === 0, errors };
}

export function summariseIesReportCardContract(report) {
  const validation = validateIesReportCardContract(report);
  return {
    ok: validation.ok,
    errors: validation.errors,
    schemaVersion: report?.schemaVersion ?? null,
    reportKind: report?.reportKind ?? null,
    defaultTheme: report?.defaultTheme ?? null,
    productName: report?.product?.name ?? null,
    manufacturer: report?.product?.manufacturer ?? null,
    cardCount: Array.isArray(report?.displayCards) ? report.displayCards.length : 0,
    verticalAngleCount: Array.isArray(report?.photometry?.verticalAngles) ? report.photometry.verticalAngles.length : 0,
    horizontalAngleCount: Array.isArray(report?.photometry?.horizontalAngles) ? report.photometry.horizontalAngles.length : 0,
    previewOnly: report?.safetyBoundary?.previewOnly === true,
    reportRenderOnly: report?.safetyBoundary?.reportRenderOnly === true,
    iesWrite: report?.safetyBoundary?.iesWrite === true,
    runtimeDataWrite: report?.safetyBoundary?.runtimeDataWrite === true,
    externalFetch: report?.safetyBoundary?.externalFetch === true
  };
}

export { REQUIRED_DISPLAY_CARDS, REQUIRED_THEMES, REQUIRED_TOP_LEVEL_FIELDS };
