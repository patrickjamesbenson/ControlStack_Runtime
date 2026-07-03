import { validateIesReportCardContract } from "./reportCardContract.js";

function normaliseAzimuth(angle) {
  const value = angle % 360;
  return value < 0 ? value + 360 : value;
}

function nearestIndex(values, target) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  values.forEach((value, index) => {
    const distance = Math.abs(value - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function mirrorQuadrantAzimuth(angle) {
  const a = normaliseAzimuth(angle);
  if (a <= 90) return a;
  if (a <= 180) return 180 - a;
  if (a <= 270) return a - 180;
  return 360 - a;
}

function mirrorHalfPlaneAzimuth(angle) {
  const a = normaliseAzimuth(angle);
  return a <= 180 ? a : 360 - a;
}

export function inferHorizontalSymmetryMode(horizontalAngles) {
  if (!Array.isArray(horizontalAngles) || horizontalAngles.length === 0) return "unavailable";
  const normalised = horizontalAngles.map(normaliseAzimuth).sort((a, b) => a - b);
  const maxAngle = normalised[normalised.length - 1];
  const has0 = normalised.includes(0);
  const has90 = normalised.includes(90);
  const has180 = normalised.includes(180);
  const has270 = normalised.includes(270);

  if (has0 && has90 && has180 && has270) return "full-cardinal";
  if (has0 && has90 && maxAngle <= 90) return "quadrant-mirror";
  if (has0 && has180 && maxAngle <= 180) return "half-plane-mirror";
  if (has0 && normalised.length === 1) return "single-plane";
  return "nearest-source-plane";
}

export function resolveHorizontalAngle(horizontalAngles, requestedAngle) {
  const mode = inferHorizontalSymmetryMode(horizontalAngles);
  const a = normaliseAzimuth(requestedAngle);
  let sourceAngle = a;

  if (mode === "quadrant-mirror") sourceAngle = mirrorQuadrantAzimuth(a);
  if (mode === "half-plane-mirror") sourceAngle = mirrorHalfPlaneAzimuth(a);
  if (mode === "single-plane") sourceAngle = horizontalAngles[0];

  const exactIndex = horizontalAngles.findIndex((angle) => normaliseAzimuth(angle) === normaliseAzimuth(sourceAngle));
  const index = exactIndex >= 0 ? exactIndex : nearestIndex(horizontalAngles.map(normaliseAzimuth), sourceAngle);

  return {
    mode,
    requestedAngle: a,
    sourceAngle: horizontalAngles[index],
    sourceIndex: index,
    mirrored: normaliseAzimuth(horizontalAngles[index]) !== a
  };
}

export function resolveVerticalAngle(verticalAngles, requestedAngle) {
  const index = nearestIndex(verticalAngles, requestedAngle);
  return {
    requestedAngle,
    sourceAngle: verticalAngles[index],
    sourceIndex: index
  };
}

export function createCandelaLookup(report) {
  const validation = validateIesReportCardContract(report);
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      lookup: () => null,
      symmetryMode: "invalid"
    };
  }

  const horizontalAngles = report.photometry.horizontalAngles;
  const verticalAngles = report.photometry.verticalAngles;
  const matrix = report.photometry.candelaMatrix;
  const symmetryMode = inferHorizontalSymmetryMode(horizontalAngles);

  return {
    ok: true,
    errors: [],
    symmetryMode,
    lookup(horizontalAngle, verticalAngle) {
      const h = resolveHorizontalAngle(horizontalAngles, horizontalAngle);
      const v = resolveVerticalAngle(verticalAngles, verticalAngle);
      return {
        candela: matrix[v.sourceIndex][h.sourceIndex],
        horizontal: h,
        vertical: v,
        source: "symmetry-aware-source-lookup"
      };
    }
  };
}
