// Lab IES toolkit — parse. Ports lib/photometry/ies.py parse_ies + utils/ies_lm63_textparser.py (donor).
// Pure, browser-safe: uses only TextDecoder + arrays/strings. No node:* imports.
import { GEOM_G_MAP, ensureHxV, num } from "./iesShared.js";

export class IesParseError extends Error {}

export function normalizeIesText(raw) {
  let s = typeof raw === "string" ? raw : new TextDecoder("utf-8").decode(raw);
  s = s.replace(/^﻿+/, "");
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/\t/g, " ").replace(/\x00/g, "");
  const lines = s.split("\n").map((ln) => ln.replace(/\s+$/, ""));
  return lines.join("\n").trim() + "\n";
}

function isHeader(line) {
  const s = line.trim();
  return s.startsWith("IES:LM-63-") || s.startsWith("IESNA:");
}
function tokenizeNumbers(lines) {
  const tokens = [];
  for (const ln of lines) for (const p of ln.trim().split(/[,\s]+/)) if (p) tokens.push(p);
  return tokens;
}
function toFloat(tok) { return Number(String(tok).replace(/,/g, "")); }

export function parseIesText(rawText) {
  const text = normalizeIesText(rawText);
  const lines = text.split("\n");
  if (!lines.length || !isHeader(lines[0])) throw new IesParseError("Invalid or missing IES header line.");
  const header = lines[0].trim();
  let i = 1;
  const keywords = {};
  const keywordsSeq = [];
  while (i < lines.length) {
    const ln = lines[i].trim();
    if (!ln) { i++; continue; }
    if (ln.toUpperCase().startsWith("TILT=")) break;
    if (ln.startsWith("[") && ln.includes("]")) {
      const end = ln.indexOf("]");
      const keyFull = ln.slice(0, end + 1).trim();
      const keyCore = keyFull.replace(/^\[|\]$/g, "");
      const val = ln.slice(end + 1).trim();
      keywords[keyFull.toUpperCase()] = val;
      keywordsSeq.push({ key: keyCore, value: val });
    } else {
      if (!("[OTHER]" in keywords)) keywords["[OTHER]"] = "";
      keywords["[OTHER]"] = (keywords["[OTHER]"] + (keywords["[OTHER]"] ? " " : "") + ln).trim();
      keywordsSeq.push({ key: "OTHER", value: ln });
    }
    i++;
  }
  if (i >= lines.length) throw new IesParseError("Missing TILT= line.");
  const tiltLine = lines[i].trim();
  if (!tiltLine.toUpperCase().startsWith("TILT=")) throw new IesParseError("Malformed TILT= line.");
  const tiltMode = tiltLine.split("=").slice(1).join("=").trim().toUpperCase();
  i++;
  let tilt;
  if (tiltMode === "INCLUDE") {
    if (i + 3 >= lines.length) throw new IesParseError("Incomplete TILT=INCLUDE block.");
    const lampGeom = parseInt(lines[i].trim(), 10); i++;
    const nTilt = parseInt(lines[i].trim(), 10); i++;
    let angTokens = tokenizeNumbers([lines[i].trim()]); i++;
    let mulTokens = tokenizeNumbers([lines[i].trim()]); i++;
    let k = i;
    while (angTokens.length < nTilt && k < lines.length) {
      const extra = lines[k].trim();
      if (extra.toUpperCase().startsWith("TILT=")) break;
      if (extra) angTokens = angTokens.concat(tokenizeNumbers([extra]));
      k++;
    }
    i = k; k = i;
    while (mulTokens.length < nTilt && k < lines.length) {
      const extra = lines[k].trim();
      if (extra.toUpperCase().startsWith("TILT=")) break;
      if (extra) mulTokens = mulTokens.concat(tokenizeNumbers([extra]));
      k++;
    }
    i = k;
    if (angTokens.length !== nTilt || mulTokens.length !== nTilt) throw new IesParseError("TILT angles/multipliers count mismatch.");
    tilt = { mode: "INCLUDE", lamp_to_lum_geom: lampGeom, angles: angTokens.map(toFloat), multipliers: mulTokens.map(toFloat) };
  } else {
    tilt = { mode: tiltMode };
  }
  const rest = lines.slice(i).filter((ln) => ln.trim());
  if (!rest.length) throw new IesParseError("Missing photometric numeric blocks.");
  const tokens = tokenizeNumbers(rest);
  let ti = 0;
  const takeNums = (n) => {
    const out = [];
    for (let k = 0; k < n; k++) {
      if (ti >= tokens.length) throw new IesParseError("Unexpected end of numeric data.");
      out.push(toFloat(tokens[ti++]));
    }
    return out;
  };
  const b1 = takeNums(10);
  const [numLamps, lumensPerLamp, multiplier, nV, nH, photometricType, unitsType, width, length, height] = b1;
  const b2 = takeNums(3);
  const [ballastFactor, fileGenType, inputWatts] = b2;
  const vAngles = takeNums(Math.trunc(nV));
  const hAngles = takeNums(Math.trunc(nH));
  const candela = [];
  for (let h = 0; h < Math.trunc(nH); h++) candela.push(takeNums(Math.trunc(nV)));
  const meta = { header, keywords_order: keywordsSeq, file_generation_type: fileGenType, ballast_factor: ballastFactor, input_watts: inputWatts };
  for (const req of ["[TEST]", "[TESTLAB]", "[ISSUEDATE]", "[MANUFAC]"]) {
    if (req in keywords) meta[req.replace(/^\[|\]$/g, "").toLowerCase()] = keywords[req];
  }
  const geometry = {
    num_lamps: Math.trunc(numLamps), lumens_per_lamp: lumensPerLamp, candela_multiplier: multiplier,
    v_count: Math.trunc(nV), h_count: Math.trunc(nH), photometric_type: Math.trunc(photometricType),
    units_type: Math.trunc(unitsType), width, length, height, ballast_factor: ballastFactor,
    input_watts: inputWatts, file_generation_type: fileGenType,
  };
  const photometry = { vertical_angles: vAngles, horizontal_angles: hAngles, candela };
  return { meta, tilt, geometry, photometry };
}

function mapGeometryToG(geom) {
  const gg = {};
  for (const [k, v] of Object.entries(geom || {})) { const gk = GEOM_G_MAP[k]; if (gk) gg[gk] = num(v); }
  if (!("G8" in gg) && "length_m" in geom) gg.G8 = num(geom.length_m);
  if (!("G7" in gg) && "width_m" in geom) gg.G7 = num(geom.width_m);
  if (!("G9" in gg) && "height_m" in geom) gg.G9 = num(geom.height_m);
  if (!("G12" in gg) && "watts" in geom) gg.G12 = num(geom.watts);
  return gg;
}

function canonize(parsed, rawText) {
  const out = { meta: {}, photometry: { geometry: {} }, _raw: rawText };
  out.meta = JSON.parse(JSON.stringify(parsed.meta || {}));
  if (parsed.tilt && typeof parsed.tilt === "object") out.tilt = JSON.parse(JSON.stringify(parsed.tilt));
  let spelledGeom = {};
  if (parsed.geometry && typeof parsed.geometry === "object") spelledGeom = parsed.geometry;
  else if (parsed.photometry && parsed.photometry.geometry) spelledGeom = parsed.photometry.geometry;
  const gmap = mapGeometryToG(spelledGeom);
  const p = parsed.photometry || {};
  const vAngles = (p.v_angles || p.vertical_angles || []).map(Number);
  const hAngles = (p.h_angles || p.horizontal_angles || []).map(Number);
  const cd = p.candela || [];
  const hCount = Math.trunc(Number.isFinite(gmap.G4) ? gmap.G4 : hAngles.length);
  const vCount = Math.trunc(Number.isFinite(gmap.G3) ? gmap.G3 : vAngles.length);
  const grid = ensureHxV(cd, hCount, vCount);
  const mult = Number(Number.isFinite(gmap.G2) ? gmap.G2 : 1) || 1;
  if (mult !== 1 && grid.length) {
    for (let hi = 0; hi < grid.length; hi++) for (let vi = 0; vi < grid[hi].length; vi++) grid[hi][vi] = grid[hi][vi] * mult;
    gmap.G2 = 1;
    if (!out.meta.notes) out.meta.notes = [];
    out.meta.notes.push("Applied candela multiplier in adapter");
  }
  out.photometry.h_angles = hAngles;
  out.photometry.v_angles = vAngles;
  out.photometry.candela = grid;
  out.photometry.geometry = gmap;
  out.photometry.geometry.G3 = Math.trunc(Number.isFinite(gmap.G3) ? gmap.G3 : vAngles.length) || vAngles.length;
  out.photometry.geometry.G4 = Math.trunc(Number.isFinite(gmap.G4) ? gmap.G4 : hAngles.length) || hAngles.length;
  return out;
}

export function parseIes(content) {
  const parsed = parseIesText(content);
  const raw = typeof content === "string" ? content : new TextDecoder("utf-8").decode(content);
  return canonize(parsed, raw);
}
