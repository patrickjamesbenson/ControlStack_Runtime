function parseKeywordLines(lines) {
  const keywords = {};
  for (const line of lines) {
    const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) keywords[match[1].trim().toUpperCase()] = match[2].trim();
  }
  return keywords;
}

function numericTokens(lines) {
  return lines
    .join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

function transposeCandela(horizontalCount, verticalCount, values) {
  const matrix = Array.from({ length: verticalCount }, () => []);
  for (let h = 0; h < horizontalCount; h += 1) {
    for (let v = 0; v < verticalCount; v += 1) {
      matrix[v][h] = values[h * verticalCount + v];
    }
  }
  return matrix;
}

export function parseLm63IesText(sourceText) {
  if (typeof sourceText !== "string" || sourceText.trim().length === 0) {
    return { ok: false, errors: ["IES text is required"] };
  }

  const lines = sourceText.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tiltIndex = lines.findIndex((line) => line.toUpperCase().startsWith("TILT="));
  if (tiltIndex < 0) return { ok: false, errors: ["TILT line is required"] };
  if (lines[tiltIndex].toUpperCase() !== "TILT=NONE") return { ok: false, errors: ["only TILT=NONE is supported in report-card parser"] };

  const keywords = parseKeywordLines(lines.slice(0, tiltIndex));
  const numbers = numericTokens(lines.slice(tiltIndex + 1));
  if (numbers.length < 13) return { ok: false, errors: ["IES numeric header is incomplete"] };

  const lamps = numbers[0];
  const lumensPerLamp = numbers[1];
  const candelaMultiplier = numbers[2];
  const verticalCount = numbers[3];
  const horizontalCount = numbers[4];
  const widthM = numbers[7];
  const lengthM = numbers[8];
  const heightM = numbers[9];
  const watts = numbers[12];

  if (!Number.isInteger(verticalCount) || !Number.isInteger(horizontalCount) || verticalCount <= 0 || horizontalCount <= 0) {
    return { ok: false, errors: ["IES angle counts are invalid"] };
  }

  const startAngles = 13;
  const verticalAngles = numbers.slice(startAngles, startAngles + verticalCount);
  const horizontalAngles = numbers.slice(startAngles + verticalCount, startAngles + verticalCount + horizontalCount);
  const candelaValues = numbers.slice(startAngles + verticalCount + horizontalCount);
  const expectedCandelaCount = verticalCount * horizontalCount;

  if (verticalAngles.length !== verticalCount || horizontalAngles.length !== horizontalCount) {
    return { ok: false, errors: ["IES angle arrays are incomplete"] };
  }

  if (candelaValues.length < expectedCandelaCount) {
    return { ok: false, errors: ["IES candela values are incomplete"] };
  }

  const matrix = transposeCandela(horizontalCount, verticalCount, candelaValues.slice(0, expectedCandelaCount))
    .map((row) => row.map((value) => value * candelaMultiplier));
  const peakCandela = Math.max(...matrix.flat());

  return {
    ok: true,
    errors: [],
    keywords,
    header: {
      lamps,
      lumensPerLamp,
      candelaMultiplier,
      verticalCount,
      horizontalCount,
      widthM,
      lengthM,
      heightM,
      watts
    },
    photometry: {
      verticalAngles,
      horizontalAngles,
      candelaMatrix: matrix
    },
    metrics: {
      lumens: lamps * lumensPerLamp,
      watts,
      peakCandela
    }
  };
}
