import { validateIesReportCardContract } from "./reportCardContract.js";
import { parseLm63IesText } from "./reportCardIesParser.js";

const DEFAULT_THEMES = ["screen-dark", "datasheet-light", "asset-transparent"];
const DEFAULT_CARDS = ["details", "polar-plot", "linear-plot", "intensities"];

function mmFromMetres(value) {
  return Number.isFinite(value) ? Math.round(value * 1000) : 0;
}

function columnAt(matrix, columnIndex) {
  return matrix.map((row) => row[columnIndex]);
}

function findAngleIndex(angles, target, fallback) {
  const index = angles.findIndex((angle) => angle === target);
  return index >= 0 ? index : fallback;
}

export function buildReportCardContractFromIesText(sourceText, metadata = {}) {
  const parsed = parseLm63IesText(sourceText);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors, report: null };
  }

  const horizontalAngles = parsed.photometry.horizontalAngles;
  const c0Index = findAngleIndex(horizontalAngles, 0, 0);
  const c90Index = findAngleIndex(horizontalAngles, 90, Math.min(1, horizontalAngles.length - 1));
  const c180Index = findAngleIndex(horizontalAngles, 180, c0Index);
  const c270Index = findAngleIndex(horizontalAngles, 270, c90Index);
  const name = metadata.name ?? parsed.keywords.LUMINAIRE ?? parsed.keywords.TEST ?? "IES report card product";
  const manufacturer = metadata.manufacturer ?? parsed.keywords.MANUFAC ?? "Unknown manufacturer";
  const catalogueCode = metadata.catalogueCode ?? parsed.keywords.LUMCAT ?? "ies-report-card";
  const lampType = metadata.lampType ?? parsed.keywords.LAMPCAT ?? "IES luminaire";
  const physicalWidthMm = metadata.physicalWidthMm ?? mmFromMetres(parsed.header.widthM);
  const physicalLengthMm = metadata.physicalLengthMm ?? mmFromMetres(parsed.header.lengthM);
  const physicalHeightMm = metadata.physicalHeightMm ?? mmFromMetres(parsed.header.heightM);

  const report = {
    schemaVersion: "ies-report-card/v1",
    reportKind: "linear-luminaire-photometric-card",
    defaultTheme: metadata.defaultTheme ?? "datasheet-light",
    supportedThemes: DEFAULT_THEMES,
    source: {
      kind: "lm63-readonly-text",
      externalFetchRequired: false,
      photometricEditorDependency: false,
      iesParserBinding: "bound-readonly"
    },
    safetyBoundary: {
      previewOnly: true,
      reportRenderOnly: true,
      iesWrite: false,
      runtimeDataWrite: false,
      donorEngineCall: false,
      externalFetch: false,
      postEndpoint: false,
      productionPhotometry: false
    },
    product: {
      name,
      manufacturer,
      family: metadata.family ?? name.split(" ").slice(0, 2).join(" "),
      catalogueCode,
      lampType,
      symmetry: "C0/C180 + C90/C270"
    },
    metrics: {
      lumens: parsed.metrics.lumens,
      watts: parsed.metrics.watts,
      peakCandela: parsed.metrics.peakCandela,
      lorPercent: metadata.lorPercent ?? 100,
      beamAngleDegrees: metadata.beamAngleDegrees ?? 0
    },
    dimensions: {
      luminous: {
        widthMm: metadata.luminousWidthMm ?? physicalWidthMm,
        lengthMm: metadata.luminousLengthMm ?? physicalLengthMm,
        heightMm: metadata.luminousHeightMm ?? 0
      },
      physical: {
        widthMm: physicalWidthMm,
        lengthMm: physicalLengthMm,
        heightMm: physicalHeightMm
      }
    },
    photometry: parsed.photometry,
    planes: {
      c0c180: {
        label: "C0/C180",
        sourceHorizontalAngles: [horizontalAngles[c0Index], horizontalAngles[c180Index]],
        verticalAngles: parsed.photometry.verticalAngles,
        candela: columnAt(parsed.photometry.candelaMatrix, c0Index)
      },
      c90c270: {
        label: "C90/C270",
        sourceHorizontalAngles: [horizontalAngles[c90Index], horizontalAngles[c270Index]],
        verticalAngles: parsed.photometry.verticalAngles,
        candela: columnAt(parsed.photometry.candelaMatrix, c90Index)
      }
    },
    exportSizing: {
      datasheetPlotWidthMm: 90,
      datasheetPlotHeightMm: 65,
      datasheetRowWidthMm: 180,
      screenPlotWidthPx: 360,
      screenPlotHeightPx: 260
    },
    displayCards: DEFAULT_CARDS
  };

  const validation = validateIesReportCardContract(report);
  return {
    ok: validation.ok,
    errors: validation.errors,
    report: validation.ok ? report : null
  };
}
