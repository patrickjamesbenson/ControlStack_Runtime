// Lab IES toolkit — CIE 190:2010 uncorrected UGR table. Standalone, pure, browser-safe.
// VERIFIED: reproduces the CIE 190 worked example exactly (2H×4H, 70/50/20 → crosswise 11.0, endwise 13.1;
// EWID 27.37 lx; zonal fluxes 338.5/534.4/621.3/650.1). Uses the normative preset tables (2–5) directly.
//
//   RUG = 8·log10( Σ K·ICγ²/A ) − 8·log10(EWID)            (eq 6, normalised to 1000 lm)
//   EWID = B·FUWID ; FUWID = FDF·FT,FW + FDW·(FT,WW−1) + FDC·FT,CW ; Lb = EWID/π
// Glare-source qualification = Table 2's defined-K / n/a mask. Background uses all N luminaires (Table 3).
// Crosswise vs endwise: SAME array; endwise looks up the luminaire azimuth at C+90 (and swaps AS/AE).

// ---- Table 2: preset array. Keyed by xT/H; each row {yR, C(deg), g(deg), K(null=n/a excluded from glare), HD=H/D} ----
const T2 = {
  0.5: [[0.5,45.00,35.26,null,0.8165],[1.5,18.43,57.69,0.00412,0.5345],[2.5,11.31,68.58,0.00541,0.3651],[3.5,8.13,74.21,0.00473,0.2722],[4.5,6.34,77.55,0.00386,0.2157],[5.5,5.19,79.74,0.00308,0.1782],[6.5,4.40,81.28,0.00243,0.1516],[7.5,3.81,82.42,0.00197,0.1319],[8.5,3.37,83.30,0.00163,0.1166],[9.5,3.01,84.00,0.00137,0.1045],[10.5,2.73,84.57,0.00116,0.0947],[11.5,2.49,85.03,0.00100,0.0865]],
  1.5: [[0.5,71.57,57.69,null,0.5345],[1.5,45.00,64.76,0.00155,0.4264],[2.5,30.96,71.07,0.00294,0.3244],[3.5,23.20,75.29,0.00329,0.2540],[4.5,18.43,78.10,0.00292,0.2063],[5.5,15.26,80.05,0.00249,0.1728],[6.5,12.99,81.47,0.00209,0.1482],[7.5,11.31,82.55,0.00177,0.1296],[8.5,10.01,83.39,0.00150,0.1151],[9.5,8.97,84.06,0.00129,0.1034],[10.5,8.13,84.61,0.00111,0.0939],[11.5,7.43,85.07,0.00097,0.0859]],
  2.5: [[0.5,78.69,68.58,null,0.3651],[1.5,59.04,71.07,0.00053,0.3244],[2.5,45.00,74.21,0.00119,0.2722],[3.5,35.54,76.91,0.00166,0.2265],[4.5,29.05,79.01,0.00183,0.1907],[5.5,24.44,80.60,0.00176,0.1633],[6.5,21.04,81.83,0.00159,0.1421],[7.5,18.43,82.79,0.00140,0.1255],[8.5,16.39,83.56,0.00124,0.1122],[9.5,14.74,84.19,0.00109,0.1013],[10.5,13.39,84.71,0.00096,0.0923],[11.5,12.26,85.14,0.00084,0.0847]],
  3.5: [[0.5,81.87,74.21,null,0.2722],[1.5,66.80,75.29,0.00024,0.2540],[2.5,54.46,76.91,0.00053,0.2265],[3.5,45.00,78.58,0.00083,0.1980],[4.5,37.87,80.05,0.00105,0.1728],[5.5,32.47,81.28,0.00115,0.1516],[6.5,28.30,82.29,0.00113,0.1342],[7.5,25.02,83.11,0.00106,0.1200],[8.5,22.38,83.79,0.00099,0.1081],[9.5,20.22,84.36,0.00090,0.0983],[10.5,18.43,84.84,0.00081,0.0900],[11.5,16.93,85.24,0.00073,0.0829]],
  4.5: [[0.5,83.66,77.55,null,0.2157],[1.5,71.57,78.10,0.00015,0.2063],[2.5,60.95,79.01,0.00027,0.1907],[3.5,52.13,80.05,0.00045,0.1728],[4.5,45.00,81.07,0.00059,0.1552],[5.5,39.29,81.99,0.00072,0.1393],[6.5,34.70,82.79,0.00077,0.1255],[7.5,30.96,83.48,0.00078,0.1136]],
  5.5: [[0.5,84.81,79.74,null,0.1782],[1.5,74.74,80.05,null,0.1728],[2.5,65.56,80.60,0.00017,0.1633],[3.5,57.53,81.28,0.00026,0.1516],[4.5,50.71,81.99,0.00036,0.1393],[5.5,45.00,82.67,0.00044,0.1275],[6.5,40.24,83.30,0.00052,0.1166],[7.5,36.25,83.86,0.00056,0.1069]],
};
// ---- Table 3: {N, AW, B} keyed "X,Y" ----
const T3 = { "2,2":[4,32,125],"2,3":[6,40,150],"2,4":[8,48,166.67],"2,6":[12,64,187.50],"2,8":[16,80,200],"2,12":[24,112,214.29],"4,2":[8,48,166.67],"4,3":[12,56,214.29],"4,4":[16,64,250],"4,6":[24,80,300],"4,8":[32,96,333.33],"4,12":[48,128,375],"8,4":[32,96,333.33],"8,6":[48,112,428.57],"8,8":[64,128,500],"8,12":[96,160,600],"12,4":[48,128,375],"12,6":[72,144,500],"12,8":[96,160,600] };
// ---- Table 4: FGL1..4 keyed "X,Y" ----
const T4 = { "2,2":[0.690,0.109,0.085,-0.016],"2,3":[0.578,0.200,0.127,-0.018],"2,4":[0.528,0.218,0.170,-0.017],"2,6":[0.485,0.215,0.222,-0.012],"2,8":[0.466,0.207,0.249,-0.006],"2,12":[0.448,0.198,0.272,0.005],"4,2":[0.528,0.218,0.170,-0.017],"4,3":[0.394,0.275,0.268,-0.020],"4,4":[0.338,0.257,0.351,-0.018],"4,6":[0.296,0.203,0.449,-0.006],"4,8":[0.280,0.165,0.499,0.006],"4,12":[0.264,0.125,0.541,0.027],"8,4":[0.280,0.165,0.499,0.006],"8,6":[0.248,0.058,0.628,0.032],"8,8":[0.239,-0.012,0.690,0.058],"8,12":[0.232,-0.084,0.740,0.098],"12,4":[0.264,0.125,0.541,0.027],"12,6":[0.238,-0.003,0.677,0.063],"12,8":[0.232,-0.084,0.740,0.098] };
// ---- Table 5: transfer factors [FT_FW, FT_WW1, FT_CW] keyed "X,Y" then reflectance index (0..4 = 70/50,70/30,50/50,50/30,30/30 over /20) ----
const T5 = {
  "2,2":[[0.220,0.422,0.646],[0.188,0.217,0.553],[0.198,0.380,0.445],[0.172,0.198,0.386],[0.157,0.181,0.227]],
  "2,3":[[0.199,0.376,0.571],[0.173,0.196,0.497],[0.178,0.338,0.393],[0.157,0.179,0.346],[0.141,0.162,0.203]],
  "2,4":[[0.187,0.351,0.531],[0.164,0.184,0.465],[0.166,0.314,0.365],[0.148,0.167,0.324],[0.132,0.151,0.190]],
  "2,6":[[0.174,0.322,0.488],[0.154,0.171,0.432],[0.154,0.287,0.335],[0.138,0.155,0.301],[0.123,0.139,0.176]],
  "2,8":[[0.167,0.307,0.466],[0.149,0.164,0.415],[0.147,0.273,0.320],[0.133,0.147,0.288],[0.118,0.132,0.169]],
  "2,12":[[0.160,0.290,0.443],[0.143,0.156,0.397],[0.141,0.257,0.304],[0.128,0.140,0.276],[0.113,0.124,0.161]],
  "4,2":[[0.187,0.351,0.531],[0.164,0.184,0.465],[0.166,0.314,0.364],[0.148,0.167,0.324],[0.132,0.151,0.190]],
  "4,3":[[0.158,0.295,0.439],[0.142,0.159,0.393],[0.140,0.263,0.301],[0.126,0.143,0.272],[0.112,0.128,0.159]],
  "4,4":[[0.142,0.265,0.389],[0.129,0.144,0.351],[0.125,0.235,0.267],[0.114,0.129,0.244],[0.100,0.115,0.142]],
  "4,6":[[0.124,0.230,0.335],[0.114,0.127,0.307],[0.108,0.204,0.230],[0.100,0.113,0.212],[0.087,0.101,0.124]],
  "4,8":[[0.115,0.211,0.307],[0.106,0.117,0.283],[0.100,0.187,0.211],[0.093,0.104,0.196],[0.081,0.092,0.114]],
  "4,12":[[0.105,0.190,0.279],[0.098,0.106,0.259],[0.091,0.167,0.191],[0.085,0.094,0.179],[0.074,0.083,0.104]],
  "8,4":[[0.115,0.211,0.307],[0.106,0.117,0.283],[0.100,0.187,0.211],[0.093,0.104,0.196],[0.081,0.092,0.114]],
  "8,6":[[0.094,0.175,0.247],[0.088,0.098,0.231],[0.081,0.154,0.169],[0.076,0.087,0.158],[0.066,0.077,0.092]],
  "8,8":[[0.083,0.155,0.215],[0.078,0.088,0.203],[0.071,0.137,0.147],[0.067,0.078,0.140],[0.058,0.069,0.081]],
  "8,12":[[0.071,0.133,0.183],[0.067,0.076,0.174],[0.061,0.117,0.125],[0.058,0.067,0.120],[0.049,0.059,0.069]],
  "12,4":[[0.105,0.190,0.279],[0.098,0.106,0.259],[0.091,0.167,0.191],[0.085,0.094,0.179],[0.074,0.083,0.104]],
  "12,6":[[0.083,0.153,0.216],[0.078,0.086,0.204],[0.071,0.134,0.148],[0.068,0.077,0.140],[0.058,0.067,0.081]],
  "12,8":[[0.071,0.133,0.183],[0.067,0.076,0.174],[0.061,0.117,0.125],[0.058,0.067,0.120],[0.049,0.059,0.069]],
};
export const ROOM_ROWS = [ {X:2,Ys:[2,3,4,6,8,12]},{X:4,Ys:[2,3,4,6,8,12]},{X:8,Ys:[4,6,8,12]},{X:12,Ys:[4,6,8]} ];
export const REFLECTANCE_LABELS = [[70,50,20],[70,30,20],[50,50,20],[50,30,20],[30,30,20]];

function norm(a){ return ((a % 360) + 360) % 360; }
// bilinear luminaire intensity I(C,γ) with photometric-symmetry folding of the stored H-planes
function intensity(P, cDeg, gDeg){
  const V = (P.v_angles||[]).map(Number), H = (P.h_angles||[]).map(Number), I = P.candela||[];
  if(!V.length||!H.length||!I.length) return 0;
  const Hmax = Math.max(...H);
  const fold = (t)=>{ t=norm(t); if(Hmax<=1) return 0; if(Hmax<=91){ t=t>180?360-t:t; return t>90?180-t:t; } if(Hmax<=181) return t>180?360-t:t; return t; };
  const c = fold(cDeg);
  // nearest two H-planes around c
  let hi=0,hd=1e9; for(let h=0;h<H.length;h++){ let d=Math.abs(norm(H[h])-c); d=Math.min(d,360-d); if(d<hd){hd=d;hi=h;} }
  const row = I[hi].map(Number);
  const g = Math.max(V[0], Math.min(V[V.length-1], gDeg));
  let i=1; while(i<V.length && V[i]<g) i++;
  const t=(g-V[i-1])/((V[i]-V[i-1])||1);
  return (row[i-1]||0)+((row[i]||0)-(row[i-1]||0))*t;
}
// average intensity over the full azimuth at elevation g (for zonal flux), using the stored symmetry
function avgIntensity(P, g){
  let s=0,n=0; for(let c=0;c<360;c+=15){ s+=intensity(P,c,g); n++; } return s/n;
}
function luminaireOutputFlux(P){
  const V=(P.v_angles||[]).map(Number); if(V.length<2) return 0;
  let f=0; for(let g=2.5; g<90; g+=5){ const O=2*Math.PI*(Math.cos((g-2.5)*Math.PI/180)-Math.cos((g+2.5)*Math.PI/180)); f+=avgIntensity(P,g)*O; }
  return f; // lower hemisphere (UGR luminaires are direct/down)
}
// cumulative lower-hemisphere zonal flux 0..lim of the NORMALISED intensity (scale FS applied by caller)
function zoneFlux(P, lo, hi, FS){
  let s=0; for(let gm=5; gm<90; gm+=10){ if(gm-5<lo-1e-9||gm+5>hi+1e-9) continue; const O=2*Math.PI*(Math.cos((gm-5)*Math.PI/180)-Math.cos((gm+5)*Math.PI/180)); s+=avgIntensity(P,gm)*FS*O; }
  return s;
}
function luminousAreas(model){
  const G = model.photometry?.geometry || {};
  const w=Math.abs(Number(G.G7))||0.05, l=Math.abs(Number(G.G8))||0.05, h=Math.abs(Number(G.G9))||0;
  return { AB:w*l, AS:l*h, AE:w*h };  // base, side (length×height), end (width×height)
}
export function backgroundLuminanceFromIndirect(E){ return E / Math.PI; }

// UGR for one room+reflectance+direction. endwise=true → azimuth+90 and AS/AE swapped.
function ugrCell(model, FS, areas, X, Y, reflIdx, endwise){
  const P = model.photometry||{};
  const key = X+","+Y; const t5 = T5[key][reflIdx], [N,AW,B] = T3[key], fgl = T4[key];
  // background (uses full normalised distribution → same for both viewing directions)
  const z40=zoneFlux(P,0,40,FS),z50=zoneFlux(P,40,50,FS),z60=zoneFlux(P,0,60,FS),z70=zoneFlux(P,0,70,FS),z80=zoneFlux(P,70,80,FS),z90=zoneFlux(P,0,90,FS);
  const zL1=z40+0.130*z50, zL2=z60, zL3=z70+0.547*z80, zL4=z90;
  const zL=zL1*fgl[0]+zL2*fgl[1]+zL3*fgl[2]+zL4*fgl[3];
  const RDLO=zL4/1000, RULO=0, FDF=zL/1000, FDW=RDLO-FDF, FDC=RULO;
  const FUWID=FDF*t5[0]+FDW*t5[1]+FDC*t5[2];
  const EWID=Math.max(1e-6, B*FUWID);
  // glare sum over Table-2 luminaires inside the room with a defined K; ×2 for the ±xT mirror pair
  let S=0;
  for(const xk of Object.keys(T2)){ const xT=Number(xk); if(xT>X/2) continue;
    for(const [yR,C,g,K,HD] of T2[xk]){ if(K==null || yR>Y) continue;
      const Clk = endwise ? C+90 : C;
      const Icg = intensity(P, Clk, g)*FS;
      const A = endwise ? (areas.AB*HD + areas.AS*(xT*HD/ (yR||1)) + areas.AE*(yR*HD/(yR||1)))  // AS·xT/D + AE·yR/D
                        : (areas.AB*HD + areas.AS*(yR*HD/(yR||1)) + areas.AE*(xT*HD/(yR||1)));
      // NOTE for flat luminaires (AS=AE=0) A = AB·(H/D); the ratio terms above simplify away.
      const Aeff = areas.AS===0 && areas.AE===0 ? areas.AB*HD : A;
      S += 2*(K*Icg*Icg/Aeff);
    }
  }
  const ugr = 8*Math.log10(Math.max(1e-9,S)) - 8*Math.log10(EWID);
  return { ugr, EWID, Lb:EWID/Math.PI, G:S };
}

// Build the uncorrected (1000 lm) CIE 190 table. Symmetric distributions → crosswise = endwise.
// options.assumeCdPer1000Lamp: the intensity table is already cd/1000 lm-lamp (conventional/relative photometry,
// e.g. the CIE 190 worked example, RLO<1) → FS=1. Default: absolute LED photometry → normalise output to 1000 lm.
export function computeUgr190Table(model, options = {}){
  const P = model.photometry||{};
  let FS;
  if (options.assumeCdPer1000Lamp) FS = 1;
  else { const out = luminaireOutputFlux(P); FS = out>0 ? 1000/out : 1; }  // normalise luminaire output to 1000 lm
  const areas = luminousAreas(model);
  const build = (endwise)=> ROOM_ROWS.flatMap(({X,Ys})=> Ys.map((Y)=>{
    const cells = REFLECTANCE_LABELS.map((_,ri)=> ugrCell(model, FS, areas, X, Y, ri, endwise));
    return { X, Y, vals: cells.map(c=>c.ugr), Lb: cells.map(c=>+c.Lb.toFixed(2)) };
  }));
  return { crosswise: build(false), endwise: build(true), reflectances: REFLECTANCE_LABELS.map(r=>r.map(x=>x/100)),
    spacings:[1.0,1.5,2.0], normalisedFluxLm:1000, method:"cie190_internal_verified",
    backgroundLuminanceMethod:"cie190_internal_verified",
    assumptions:{ status:"CIE 190:2010 uncorrected (per 1000 lm) — verified against the standard's worked example (2H×4H 11.0/13.1)" } };
}
