// Lab IES toolkit - canonical polar renderer (Viso-style). SINGLE SOURCE: every harness (labbench, summary, ...)
// imports this so they all render identically. Do not copy this logic inline anywhere - import renderPolar instead.
// Two vertical planes (C0/C180 red, C90/C270 blue) as translucent-yellow lobes with thin outlines; Catmull-Rom
// spline between measured angles; nice-max rings; floating origin so the curve bbox centres (Viso convention).

// smallest "nice" number >= x, in {1,1.5,2,2.5,3,4,5,6,8,10}*10^k
export function niceCeil(x){ if(!Number.isFinite(x) || !(x>0)) return 1; const e=Math.floor(Math.log10(x)); const b=Math.pow(10,e); const f=x/b;
  for(const o of [1,1.5,2,2.5,3,4,5,6,8,10]) if(f<=o+1e-9) return o*b; return 10*b; }

const emptyPolar = () => ({ svg:"<div style='color:#888'>no candela data</div>", planes:"" });
const strictlyAscending = values => values.every((value,index)=>index===0 || value>values[index-1]);

export function renderPolar(model){
  const P = model && typeof model === "object" && model.photometry && typeof model.photometry === "object"
    ? model.photometry
    : {};
  if(!Array.isArray(P.v_angles) || !Array.isArray(P.candela) || !Array.isArray(P.h_angles)) return emptyPolar();
  const V = P.v_angles.map(Number);
  const H = P.h_angles.map(Number);
  if(!V.length || !P.candela.length || !V.every(value=>Number.isFinite(value) && value>=0 && value<=180) || !H.every(value=>Number.isFinite(value) && value>=0 && value<=360) || !strictlyAscending(V) || !strictlyAscending(H)) return emptyPolar();
  const I = [];
  for(const row of P.candela){
    if(!Array.isArray(row) || row.length !== V.length) return emptyPolar();
    const values = row.map(Number);
    if(!values.every(value=>Number.isFinite(value) && value>=0)) return emptyPolar();
    I.push(values);
  }
  if(I.length !== Math.max(1,H.length) || (I.length>1 && H.length!==I.length)) return emptyPolar();
  const iAt=(line,v)=>{ const n=V.length; if(v<=V[0])return line[0]||0; if(v>=V[n-1])return line[n-1]||0; let i=1; while(i<n&&V[i]<v)i++;
    const p1=line[i-1]||0, p2=line[i]||0, p0=(i-2>=0?line[i-2]:p1), p3=(i+1<n?line[i+1]:p2);
    const t=(v-V[i-1])/(V[i]-V[i-1]), t2=t*t, t3=t2*t;
    const val=0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);
    return val>0?val:0; };
  const Hmax = H.length ? Math.max(...H) : 0;
  const foldH=(t)=>{ t=((t%360)+360)%360; if(Hmax<=1) return 0; if(Hmax<=91){ t=t>180?360-t:t; return t>90?180-t:t; } if(Hmax<=181) return t>180?360-t:t; return t; };
  const planeAt=(target)=>{ const t=foldH(target); let bi=0,bd=Infinity; for(let h=0;h<H.length;h++){ let d=Math.abs(H[h]-t); d=Math.min(d,360-d); if(d<bd){bd=d;bi=h;} } return I[bi]; };
  const c0=planeAt(0), c180=planeAt(180), c90=planeAt(90), c270=planeAt(270);
  const pts=(right,left)=>{ const p=[]; for(let v=180;v>=0;v--){ const cd=iAt(left,v), a=v*Math.PI/180; p.push([-cd*Math.sin(a), cd*Math.cos(a)]); }
    for(let v=0;v<=180;v++){ const cd=iAt(right,v), a=v*Math.PI/180; p.push([cd*Math.sin(a), cd*Math.cos(a)]); } return p; };
  const redPts=pts(c0,c180), bluePts=pts(c90,c270);
  let peak=1; for(const row of I) for(const value of row) if(value>peak) peak=value;
  const step=niceCeil(peak/5), nRings=Math.max(1,Math.ceil(peak/step));
  const all=redPts.concat(bluePts,[[0,0]]);
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for(const [x,y] of all){ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
  const AVAIL=166, CY=97;
  const scale=AVAIL/Math.max(1, maxX-minX, maxY-minY);
  const ox=100 - scale*(minX+maxX)/2, oy=CY - scale*(minY+maxY)/2;
  const S=(x,y)=>[(ox+scale*x), (oy+scale*y)];
  const firstR=step*scale;
  const dOf=(pp)=>pp.map((p,i)=>{ const [x,y]=S(p[0],p[1]); return (i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2); }).join(" ");
  const GRID="#8a8a8a", TXT="#3a3a3a";
  const BX={xmin:6,xmax:194,ymin:6,ymax:194};
  const exitAt=(dx,dy)=>{ const ts=[]; if(dx>1e-9)ts.push((BX.xmax-ox)/dx); else if(dx<-1e-9)ts.push((BX.xmin-ox)/dx); if(dy>1e-9)ts.push((BX.ymax-oy)/dy); else if(dy<-1e-9)ts.push((BX.ymin-oy)/dy); const t=Math.min(...ts.filter(x=>x>0)); return [ox+dx*t, oy+dy*t]; };
  let rings=""; for(let k=1;k<=nRings;k++){ rings+=`<circle cx="${ox.toFixed(2)}" cy="${oy.toFixed(2)}" r="${(k*step*scale).toFixed(2)}" fill="none" stroke="${GRID}" stroke-width="0.5"/>`; }
  let spokes="", ang=""; const placed=[];
  const spoke=(v,sign)=>{ const a=v*Math.PI/180, dx=sign*Math.sin(a), dy=Math.cos(a);
    const x0=ox+firstR*dx, y0=oy+firstR*dy, [ex,ey]=exitAt(dx,dy);
    spokes+=`<line x1="${x0.toFixed(2)}" y1="${y0.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="${GRID}" stroke-width="0.5"/>`;
    const lx=Math.max(5,Math.min(195,ex+dx*3)), ly=Math.max(7,Math.min(197,ey+dy*3+1.9));
    const touchesTop = ey <= BX.ymin + 0.5;
    if(!touchesTop && !placed.some(p=>Math.hypot(p[0]-lx,p[1]-ly)<10)){ placed.push([lx,ly]); ang+=`<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="5.475" fill="${TXT}">${v}°</text>`; } };
  let vLit=0; for(const ln of I) for(let q=0;q<V.length;q++){ if(ln[q] > 0.01*peak && V[q]>vLit) vLit=V[q]; }
  const angCap=Math.min(180, Math.max(90, Math.ceil(vLit/15)*15));
  for(const v of [0,15,30,45,60,75,90,105,120,135,150,165,180]){ if(v>angCap) continue; if(v===0||v===180) spoke(v,1); else { spoke(v,1); spoke(v,-1); } }
  let cand=""; for(let k=1;k<=nRings;k++){ const y=oy+k*step*scale; cand+=`<text x="${ox.toFixed(2)}" y="${(y+1.9).toFixed(2)}" text-anchor="middle" paint-order="stroke" stroke="#ffffff" stroke-width="1.6" font-family="Arial,sans-serif" font-size="5.475" fill="${TXT}">${Math.round(k*step)}</text>`; }
  const svg = `<svg viewBox="0 0 200 200" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;max-width:300px;margin:0 auto">
    <rect x="0" y="0" width="200" height="200" fill="#ffffff"/>
    ${rings}${spokes}
    <path d="${dOf(redPts)} Z" fill="rgb(255,250,156)" fill-opacity="0.5" stroke="none"/>
    <path d="${dOf(bluePts)} Z" fill="rgb(255,250,156)" fill-opacity="0.5" stroke="none"/>
    <path d="${dOf(bluePts)}" fill="none" stroke="rgb(99,99,223)" stroke-width="0.5"/>
    <path d="${dOf(redPts)}" fill="none" stroke="rgb(225,88,88)" stroke-width="0.5"/>
    ${cand}${ang}
  </svg>`;
  return { svg, peak, redPts, bluePts };
}
