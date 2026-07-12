// Lab IES toolkit - TILT about the WIDTH axis: rotate the distribution and resample onto the grid.
// Tilting about the width (C90-C270) axis swings the beam in the C0-C180 plane; 180 deg sends it up (a flip).
// Bilinear in BOTH gamma and azimuth so repeated small tilts stay smooth (no stair-stepping). Pure, browser-safe.
function d2r(a){ return a*Math.PI/180; } function r2d(a){ return a*180/Math.PI; }
function norm360(a){ return ((a%360)+360)%360; }
function dirFromCG(C,g){ const gr=d2r(g),cr=d2r(C); return [Math.sin(gr)*Math.cos(cr), Math.sin(gr)*Math.sin(cr), Math.cos(gr)]; }
function cgFromDir(v){ let[x,y,z]=v; const n=Math.hypot(x,y,z)||1; x/=n;y/=n;z/=n;
  const g=r2d(Math.acos(Math.max(-1,Math.min(1,z)))); const C=norm360(r2d(Math.atan2(y,x))); return {C,g}; }
function rot(v,k,ang){ const c=Math.cos(ang),s=Math.sin(ang); const[kx,ky,kz]=k; const[vx,vy,vz]=v;
  const dot=kx*vx+ky*vy+kz*vz; const cx=ky*vz-kz*vy, cy=kz*vx-kx*vz, cz=kx*vy-ky*vx;
  return [vx*c+cx*s+kx*dot*(1-c), vy*c+cy*s+ky*dot*(1-c), vz*c+cz*s+kz*dot*(1-c)]; }
function makeSampler(P){
  const V=(P.v_angles||[]).map(Number), H=(P.h_angles||[]).map(Number), I=P.candela||[];
  const Hmax=H.length?Math.max(...H):0;
  const fold=(t)=>{ t=norm360(t); if(Hmax<=1)return 0; if(Hmax<=91){t=t>180?360-t:t;return t>90?180-t:t;} if(Hmax<=181)return t>180?360-t:t; return t; };
  const sampleG=(row,g)=>{ const gg=Math.max(V[0],Math.min(V[V.length-1],g)); let i=1; while(i<V.length&&V[i]<gg)i++;
    const t=(gg-V[i-1])/((V[i]-V[i-1])||1); return (Number(row[i-1])||0)+((Number(row[i])||0)-(Number(row[i-1])||0))*t; };
  return (C,g)=>{
    if(!V.length||!H.length||!I.length) return 0;
    const c=fold(C);
    let lo=-1;
    for(let h=0;h<H.length-1;h++){ const a=norm360(H[h]), b=norm360(H[h+1]); if(b>=a){ if(c>=a-1e-9 && c<=b+1e-9){ lo=h; break; } } else { if(c>=a-1e-9 || c<=b+1e-9){ lo=h; break; } } }
    if(lo<0){ let bi=0,bd=1e9; for(let h=0;h<H.length;h++){ let d=Math.abs(norm360(H[h])-c); d=Math.min(d,360-d); if(d<bd){bd=d;bi=h;} } return sampleG(I[bi],g); }
    let a=norm360(H[lo]), span=norm360(H[lo+1])-a; if(span<0) span+=360;
    const f = span>1e-9 ? norm360(c-a)/span : 0;
    return sampleG(I[lo],g)*(1-f) + sampleG(I[lo+1],g)*f;   // bilinear in azimuth too -> smooth
  };
}
export function tilt(phot, degrees, axis="short"){
  const ax = axis==="long" ? [1,0,0] : [0,1,0];   // "short" = width (C90-C270) axis; beam swings in C0-C180 plane
  const ang = d2r(Number(degrees)||0); const sampler = makeSampler(phot);
  const V=(phot.v_angles||[]).map(Number), H=(phot.h_angles||[]).map(Number);
  const out = JSON.parse(JSON.stringify(phot));
  out.candela = H.map((C)=> V.map((g)=>{ const d=dirFromCG(C,g); const s=rot(d,ax,-ang); const cg=cgFromDir(s); return sampler(cg.C, cg.g); }));
  return out;
}
