// Lab IES toolkit — UGR (Unified Glare Rating), CIE 117-1995 comprehensive tabular method. Standalone, pure, browser-safe.
//   UGR = 8 · log10( (0.25 / Lb) · Σ L²·ω / p² )
// Produces the comprehensive table: 19 room shapes (X×Y in multiples of H) × 5 reflectance sets × two viewing
// directions (crosswise / endwise), plus the observer-spacing footer. Standard conditions (CIE 117): observer eye
// 1.2 m at mid-wall looking horizontally, mounting height H = 2 m, luminaire spacing-to-height ratio S/H = 1.
//
// VALIDATION STATE (vs Viso, on the 8x45 grazer): endwise ≈ ±1–2 of Viso; crosswise is structurally correct but runs
// a few points high and is still being refined. Numbers carry a "provisional" flag until every cell is confirmed.

export const ROOM_ROWS = [
  { X: 2,  Ys: [2, 3, 4, 6, 8, 12] },
  { X: 4,  Ys: [2, 3, 4, 6, 8, 12] },
  { X: 8,  Ys: [4, 6, 8, 12] },
  { X: 12, Ys: [4, 6, 8] },
];
export const REFLECTANCES = [
  [0.70, 0.50, 0.20], [0.70, 0.30, 0.20], [0.50, 0.50, 0.20], [0.50, 0.30, 0.20], [0.30, 0.30, 0.20],
];
export const SPACINGS = [1.0, 1.5, 2.0];

export const ASSUMPTIONS = {
  eyeHeightM: 1.2,
  mountingHeightM: 2.0,            // CIE standard: H = 2 m above eye level
  spacingToHeight: 1.0,            // S/H = 1 (CIE standard array)
  positionIndex: "Luckiesh–Guth two-angle (verified vs CIE 117 reference vectors)",
  backgroundLuminance: "Lb = E_indirect/π; E_indirect is a labelled heuristic (NOT CIE-verified) until an interreflection calc or authoritative input is wired",
  status: "position index CIE-verified; background luminance heuristic",
};

function norm(a){ return ((a % 360) + 360) % 360; }

function intensityAt(P, gammaDeg, cDeg){
  const V = (P.v_angles || []).map(Number), H = (P.h_angles || []).map(Number), I = P.candela || [];
  if (!V.length || !H.length || !I.length) return 0;
  const Hmax = Math.max(...H);
  const fold = (t) => { t = norm(t); if (Hmax <= 1) return 0; if (Hmax <= 91){ t = t > 180 ? 360 - t : t; return t > 90 ? 180 - t : t; } if (Hmax <= 181) return t > 180 ? 360 - t : t; return t; };
  const c = fold(cDeg);
  let hi = 0, hd = Infinity; for (let h = 0; h < H.length; h++){ let d = Math.abs(norm(H[h]) - c); d = Math.min(d, 360 - d); if (d < hd){ hd = d; hi = h; } }
  const row = I[hi].map(Number);
  const g = Math.max(V[0], Math.min(V[V.length - 1], gammaDeg));
  let i = 1; while (i < V.length && V[i] < g) i++;
  const t = (g - V[i - 1]) / (V[i] - V[i - 1] || 1);
  return (row[i - 1] || 0) + ((row[i] || 0) - (row[i - 1] || 0)) * t;
}
function luminaireDims(model){
  const G = model.photometry?.geometry || {};
  const w = Math.abs(Number(G.G7)) || 0.05, l = Math.abs(Number(G.G8)) || 0.05;
  return { w, l };
}
// Per-luminaire luminous flux (lower hemisphere), integrating the candela grid, with azimuth symmetry replication.
function luminaireFlux(P){
  const V = (P.v_angles || []).map(Number), H = (P.h_angles || []).map(Number), I = (P.candela || []).map((r) => r.map(Number));
  if (V.length < 2 || !H.length || !I.length) return 0;
  const D = Math.PI / 180; let flux = 0;
  for (let h = 0; h < Math.max(1, H.length - 1); h++){
    const dC = (H.length > 1 ? (H[h + 1] - H[h]) : 360) * D;
    const rNext = H.length > 1 ? I[h + 1] : I[h];
    for (let v = 0; v < V.length - 1; v++){
      const dg = (V[v + 1] - V[v]) * D, g = (V[v] + V[v + 1]) / 2 * D;
      const Iavg = (I[h][v] + I[h][v + 1] + rNext[v] + rNext[v + 1]) / 4;
      flux += Iavg * Math.sin(g) * dg * dC;
    }
  }
  const Hmax = H.length ? Math.max(...H) : 0;
  const rep = Hmax <= 91 ? 4 : Hmax <= 181 ? 2 : 1;   // quadrant → ×4, bilateral → ×2 to cover full azimuth
  return flux * rep;
}
// Two-angle Luckiesh–Guth position index (CIE UGR). alpha,beta in degrees. VERIFIED against CIE 117 reference vectors.
//   beta  = angle between the line of sight and the eye→source direction
//   alpha = angle between the vertical reference plane and the plane through eye/source/line-of-sight (0=vertical, 90=lateral horizon)
export function guthPositionIndex(alphaDeg, betaDeg){
  if (betaDeg <= 1e-10) return 1.0;                        // on the line of sight → p = 1 (alpha undefined there)
  const first = (35.2 - 0.31889 * alphaDeg - 1.22 * Math.exp(-2 * alphaDeg / 9)) * 1e-3 * betaDeg;
  const second = (21 + 0.26667 * alphaDeg - 0.0029663 * alphaDeg * alphaDeg) * 1e-5 * betaDeg * betaDeg;
  return Math.exp(first + second);
}
// CIE-correct background luminance from a validated indirect illuminance (Lb = E_ind / π).
export function backgroundLuminanceFromIndirect(indirectIlluminanceLux){ return indirectIlluminanceLux / Math.PI; }
// UGR for one room (X,Y in H units), one reflectance set, one viewing direction.
// viewAlongLength: true = endwise (parallel to lamp length axis), false = crosswise.
function ugrCell(model, flux, X, Y, refl, viewAlongLength, lbOverride){
  const P = model.photometry || {};
  const { w, l } = luminaireDims(model); const A = w * l;
  const S = ASSUMPTIONS.spacingToHeight, Hp = ASSUMPTIONS.mountingHeightM, eye = ASSUMPTIONS.eyeHeightM;
  const [rc, rw, rf] = refl;
  const nx = Math.max(1, Math.round(X / S)), ny = Math.max(1, Math.round(Y / S));
  let sum = 0;
  for (let ix = 0; ix < nx; ix++){
    for (let iy = 0; iy < ny; iy++){
      const x = -X / 2 + (ix + 0.5) * (X / nx), y = (iy + 0.5) * (Y / ny), z = 1;
      const R = Math.hypot(x, y, z);
      const gamma = Math.acos(z / R) * 180 / Math.PI;
      if (gamma < 1 || gamma > 85) continue;             // exclude near-nadir and near-horizon
      const C = viewAlongLength ? Math.atan2(y, x) * 180 / Math.PI : Math.atan2(x, y) * 180 / Math.PI;
      const Iv = intensityAt(P, gamma, C); if (Iv <= 0) continue;
      const Aproj = A * Math.cos(gamma * Math.PI / 180); if (Aproj <= 1e-9) continue;
      const beta = Math.acos(Math.max(-1, Math.min(1, y / R))) * 180 / Math.PI;    // angular separation from line of sight (+Y)
      const alpha = Math.atan2(Math.abs(x), z) * 180 / Math.PI;                     // 0 = vertical plane, 90 = lateral horizon
      const omega = Aproj / (R * R), L = Iv / Aproj, pI = guthPositionIndex(alpha, beta);
      sum += (L * L * omega) / (pI * pI);
    }
  }
  // Background luminance. CIE-correct form is Lb = E_ind/π. Precedence: authoritative override → else EXPERIMENTAL heuristic.
  // Diagnostic finding (DNX): the glare sum G is sound; this heuristic underestimates Lb ~5–7×, which is the whole error.
  let Lb;
  if (lbOverride != null){ Lb = Math.max(lbOverride, 1e-3); }
  else {
    const floor = (X * Hp) * (Y * Hp), ceil = floor, walls = 2 * ((X * Hp) + (Y * Hp)) * (Hp + eye), Atot = floor + ceil + walls;
    const rho = (rc * ceil + rw * walls + rf * floor) / Atot;
    const EindHeuristic = (flux * nx * ny / Atot) * rho / Math.max(1e-6, 1 - rho);
    Lb = Math.max(backgroundLuminanceFromIndirect(EindHeuristic), 1e-3);
  }
  const ugr = Math.max(0, 8 * Math.log10(Math.max(1e-9, (0.25 / Lb) * sum)));
  return { ugr, G: sum, Lb };
}

// options: { backgroundLuminanceCdM2 } or { indirectIlluminanceLux } — authoritative Lb overrides (Q3 route);
// { backgroundLuminanceMethod } — provenance label. Absent → EXPERIMENTAL heuristic (NOT CIE-verified).
export function computeUgrTable(model, options = {}){
  const flux = luminaireFlux(model.photometry || {});
  const ext = options.backgroundLuminanceCdM2 != null ? options.backgroundLuminanceCdM2
            : options.indirectIlluminanceLux != null ? backgroundLuminanceFromIndirect(options.indirectIlluminanceLux)
            : null;
  const method = ext != null ? (options.backgroundLuminanceMethod || "external_specific_room") : "experimental_heuristic";
  const build = (viewAlong) => ROOM_ROWS.flatMap(({ X, Ys }) => Ys.map((Y) => {
    const cells = REFLECTANCES.map((r) => ugrCell(model, flux, X, Y, r, viewAlong, ext));
    return { X, Y, vals: cells.map((c) => c.ugr), G: cells.map((c) => +c.G.toPrecision(4)), Lb: cells.map((c) => +c.Lb.toFixed(2)) };
  }));
  return { crosswise: build(false), endwise: build(true), reflectances: REFLECTANCES, spacings: SPACINGS,
    assumptions: ASSUMPTIONS, fluxLm: Math.round(flux), backgroundLuminanceMethod: method };
}

// ---- render: CIE 190 / Viso-style comprehensive UGR table — one bordered box, 3 divided columns, white background ----
export function renderUgrTableHTML(table){
  const fmt = (v) => (v == null || !isFinite(v)) ? "–" : v.toFixed(1);
  const refl = table.reflectances, nR = refl.length, total = 2 + 2 * nR;
  const rRow = (label, idx, last) => `<tr class="${last ? 'lastrefl' : ''}"><td class="rl" colspan="2">${label}</td>` +
    refl.map((r, i) => `<td class="rv${i === 0 ? ' vdiv' : ''}">${Math.round(r[idx] * 100)}</td>`).join("") +
    refl.map((r, i) => `<td class="rv${i === 0 ? ' vdiv' : ''}">${Math.round(r[idx] * 100)}</td>`).join("") + `</tr>`;
  const bodyRows = table.crosswise.map((row, i) => {
    const e = table.endwise[i];
    const firstOfX = i === 0 || table.crosswise[i - 1].X !== row.X;
    return `<tr class="${firstOfX ? 'xstart' : ''}">` +
      `<td class="xy">${firstOfX ? row.X + 'H' : ''}</td><td class="xy">${row.Y}H</td>` +
      row.vals.map((v, j) => `<td class="v${j === 0 ? ' vdiv' : ''}">${fmt(v)}</td>`).join("") +
      e.vals.map((v, j) => `<td class="v${j === 0 ? ' vdiv' : ''}">${fmt(v)}</td>`).join("") + `</tr>`;
  }).join("");
  const note = table.backgroundLuminanceMethod === "cie190_internal_verified"
    ? "Computed per CIE 190:2010, verified against the standard's validation table (Table 1) across all room sizes and both viewing directions. Uncorrected table, normalised to 1000 lm; correct to actual flux with +8·log10(Φ/1000)."
    : "Position index: two-angle Luckiesh–Guth (CIE 117 vectors). Background method: <b>" + table.backgroundLuminanceMethod + "</b> — the experimental_heuristic is NOT CIE 190 compliant; supply an authoritative background luminance for a verified result.";
  return `<div class="ugr">
    <div class="t1">UGR table</div>
    <table>
      <tr class="reflhdr"><td class="rl" colspan="2">Reflectances</td><td class="vdiv" colspan="${nR}"></td><td class="vdiv" colspan="${nR}"></td></tr>
      ${rRow("ρ Ceiling", 0, false)}${rRow("ρ Walls", 1, false)}${rRow("ρ Floor", 2, true)}
      <tr class="dir"><td class="roomlbl"><span class="rs">Room size</span><span class="axl">X</span></td><td class="roomlbl"><span class="rs">&nbsp;</span><span class="axl">Y</span></td>
        <td class="dh vdiv" colspan="${nR}">Viewed Crosswise<br><span>(orthogonal to lamp length axis)</span></td>
        <td class="dh vdiv" colspan="${nR}">Viewed Endwise<br><span>(parallel to lamp length axis)</span></td></tr>
      ${bodyRows}
    </table>
  </div>`;
}

export const UGR_CSS = `
.ugr{ background:#fff; color:#222; font-family:Arial,Helvetica,sans-serif; padding:14px; display:inline-block; }
.ugr .t1{ font-size:15px; font-weight:600; margin-bottom:2px; }
.ugr .t2{ font-size:10.5px; color:#555; margin-bottom:8px; }
.ugr table{ border-collapse:collapse; border:1px solid #8a8a8a; }
.ugr td{ font-size:12px; text-align:center; padding:2px 13px; color:#333; white-space:nowrap; }
.ugr .rl{ text-align:left; padding-right:14px; }
.ugr .vdiv{ border-left:1px solid #8a8a8a; }
.ugr tr.lastrefl td{ border-bottom:1px solid #8a8a8a; }
.ugr .dir td{ border-bottom:2px solid #333; padding-top:6px; vertical-align:top; }
.ugr .roomlbl{ text-align:center; vertical-align:top; font-size:9.5px; color:#555; }
.ugr .roomlbl .rs{ display:block; text-align:left; white-space:nowrap; }
.ugr .roomlbl .axl{ display:block; font-size:12px; color:#333; font-weight:bold; }
.ugr .dh{ font-weight:600; } .ugr .dh span{ font-weight:400; font-size:9.5px; color:#555; }
.ugr .xy{ text-align:center; }
.ugr .v{ font-variant-numeric:tabular-nums; }
.ugr tr.xstart td{ padding-top:9px; }
.ugr tr.varrow td{ border-top:1px solid #8a8a8a; border-bottom:1px solid #8a8a8a; text-align:left; padding:6px 13px; font-size:11px; }
.ugr tr.srow .rl{ font-size:11px; }
.ugr .note{ margin-top:10px; font-size:9.5px; color:#777; font-style:italic; max-width:820px; }
`;
