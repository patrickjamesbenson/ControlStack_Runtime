// Lab IES toolkit - LEVEL (tilt-correct). Pure, browser-safe. v1.
// A real measurement can sit off-level in BOTH vertical planes (the fitting was not perfectly level
// on the goniometer). "Level" finds the peak direction and rotates the whole distribution so the peak
// sits at true nadir (gamma=0), centred - a single spherical rotation handles both planes at once.
// It resamples the intensity onto the file's own angular grid. Candela magnitudes are preserved
// (resampled), only their angular positions move. Symmetrisation should run AFTER this.
function d2r(a){ return a*Math.PI/180; } function r2d(a){ return a*180/Math.PI; }
function norm360(a){ return ((a%360)+360)%360; }
function dirFromCG(C,g){ const gr=d2r(g),cr=d2r(C); return [Math.sin(gr)*Math.cos(cr), Math.sin(gr)*Math.sin(cr), Math.cos(gr)]; }
function cgFromDir(v){ let[x,y,z]=v; const n=Math.hypot(x,y,z)||1; x/=n;y/=n;z/=n;
  const g=r2d(Math.acos(Math.max(-1,Math.min(1,z)))); const C=norm360(r2d(Math.atan2(y,x))); return {C,g}; }
// Rodrigues: rotate v about unit axis k by angle ang
function rot(v,k,ang){ const c=Math.cos(ang),s=Math.sin(ang); const[kx,ky,kz]=k; const[vx,vy,vz]=v;
  const dot=kx*vx+ky*vy+kz*vz;
  const cx=ky*vz-kz*vy, cy=kz*vx-kx*vz, cz=kx*vy-ky*vx;
  return [vx*c+cx*s+kx*dot*(1-c), vy*c+cy*s+ky*dot*(1-c), vz*c+cz*s+kz*dot*(1-c)]; }
// fold-aware bilinear-in-gamma sampler over the stored H-planes
function makeSampler(P){
  const V=(P.v_angles||[]).map(Number), H=(P.h_angles||[]).map(Number), I=P.candela||[];
  const Hmax=H.length?Math.max(...H):0;
  const fold=(t)=>{ t=norm360(t); if(Hmax<=1)return 0; if(Hmax<=91){t=t>180?360-t:t;return t>90?180-t:t;} if(Hmax<=181)return t>180?360-t:t; return t; };
  return (C,g)=>{
    if(!V.length||!H.length||!I.length) return 0;
    const c=fold(C);
    let hi=0,hd=Infinity; for(let h=0;h<H.length;h++){ let d=Math.abs(norm360(H[h])-c); d=Math.min(d,360-d); if(d<hd){hd=d;hi=h;} }
    const row=I[hi].map(Number);
    const gg=Math.max(V[0],Math.min(V[V.length-1],g));
    let i=1; while(i<V.length && V[i]<gg) i++;
    const t=(gg-V[i-1])/((V[i]-V[i-1])||1);
    return (row[i-1]||0)+((row[i]||0)-(row[i-1]||0))*t;
  };
}
function peakDir(P){
  const V=P.v_angles.map(Number), H=P.h_angles.map(Number), I=P.candela;
  let mx=-Infinity,pc=0,pg=0;
  for(let h=0;h<I.length;h++) for(let v=0;v<I[h].length;v++){ const c=Number(I[h][v]); if(c>mx){mx=c;pc=H[h];pg=V[v];} }
  return { dir:dirFromCG(pc,pg), C:pc, g:pg, max:mx };
}
export function detectTilt(model){
  const P=model.photometry||{}; const pk=peakDir(P);
  return { tiltDeg:+pk.g.toFixed(3), tiltAzimuthDeg:+pk.C.toFixed(3), peakGamma:pk.g, peakC:pk.C };
}
export function level(model, opts={}){
  const P=model.photometry||{};
  const pk=peakDir(P); const p=pk.dir; const nadir=[0,0,1];
  let ax=[ p[1]*nadir[2]-p[2]*nadir[1], p[2]*nadir[0]-p[0]*nadir[2], p[0]*nadir[1]-p[1]*nadir[0] ];
  const axn=Math.hypot(ax[0],ax[1],ax[2]);
  const ang=Math.acos(Math.max(-1,Math.min(1, p[2])));   // angle between peak and nadir
  const sampler=makeSampler(P);
  const V=P.v_angles.map(Number), H=P.h_angles.map(Number);
  let outCandela, applied=false;
  if(axn<1e-9 || ang<1e-9){ outCandela=P.candela.map(r=>r.map(Number)); }
  else {
    ax=ax.map(x=>x/axn); applied=true;
    outCandela = H.map((C)=> V.map((g)=>{
      const d=dirFromCG(C,g);
      const s=rot(d,ax,-ang);          // inverse rotation: source dir for this target grid point
      const cg=cgFromDir(s);
      return sampler(cg.C, cg.g);
    }));
  }
  const out=JSON.parse(JSON.stringify(model));
  out.photometry.candela=outCandela;
  out.meta=out.meta||{}; out.meta.notes=out.meta.notes||[];
  out.meta.notes.push("Level (tilt-correct): peak "+pk.g.toFixed(2)+" deg off nadir at C"+pk.C.toFixed(0)+" -> nadir");
  return { model:out, tiltDeg:+r2d(ang).toFixed(3), tiltAzimuthDeg:+pk.C.toFixed(3), applied };
}
