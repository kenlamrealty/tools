/* Ken Lam Tools — tìm hướng nhà từ địa chỉ / link bản đồ + la bàn điện thoại.
   Dùng chung cho các tool phong thủy (T40, T42, T404, T406, T409, T412, T413, T415, T417).
   Chạy hết trên trình duyệt: OpenStreetMap (Nominatim + Overpass), ảnh vệ tinh Esri. Không gửi gì về server Ken.
   Cách tính: địa chỉ → tọa độ → căn nhà (building) trong OSM → con đường có tên trong địa chỉ →
   góc từ giữa nhà nhìn thẳng ra đường, nắn theo cạnh tường mặt tiền. Ra HƯỚNG THẬT; hướng từ = thật − DECL.
   KLHuong.mount({after:Element, ref:'mag'|'true', compass:bool, apply:function(deg){return 'chữ báo đã điền'}}) */
(function(){
'use strict';
var DECL=12.7; /* độ lệch từ San Jose, NOAA WMM2025, 11/2026 — giống các tool */
var NOMI='https://nominatim.openstreetmap.org/search';
var OVP=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
var TILE='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
var LS='kl_huong_addr';

var T={
vi:{lbl:'Hoặc dán địa chỉ / link bản đồ',lbl_s:'(Google Maps, Apple Maps, Zillow, Redfin)',ph:'961 S Jackson Ave, San Jose',go:'Tìm hướng',
 cmp:'Đo bằng la bàn điện thoại',cmp_use:'Dùng số này',cmp_stop:'Tắt',cmp_wait:'Đang chờ la bàn… xoay điện thoại theo hình số 8.',cmp_none:'Máy này không có la bàn. Dùng điện thoại, hoặc dán địa chỉ ở trên.',cmp_deny:'Chưa cho phép la bàn. Vào Settings → Safari → Motion & Orientation Access rồi thử lại.',cmp_how:'Đứng ngay sau cửa chính, lưng quay vào nhà, cầm điện thoại nằm ngang, đầu máy chĩa ra cửa.',cmp_live:'La bàn đang chỉ',
 busy:'Đang tìm căn nhà…',busy2:'Đang đọc bản đồ quanh căn nhà…',
 e_empty:'Anh chị dán địa chỉ hoặc link bản đồ vào ô trên.',e_short:'Link rút gọn (maps.app.goo.gl) không mở được từ trang này. Mở link trên điện thoại, bấm vào căn nhà, copy địa chỉ rồi dán vào đây.',
 e_geo:'Không tìm ra địa chỉ này. Thử ghi đủ: số nhà, tên đường, thành phố, zip.',e_net:'Bản đồ đang bận hoặc mất mạng. Đợi chút rồi bấm lại.',e_road:'Không thấy con đường quanh căn nhà trên bản đồ. Nên đo bằng la bàn tại chỗ.',
 faces:'Nhà nhìn ra',tru:'Hướng thật (bản đồ)',mag:'Hướng từ (la bàn)',filled:'Đã điền',
 conf_hi:'Khá chắc: tìm đúng căn nhà và mặt tiền trên bản đồ.',conf_md:'Ước lượng: chưa khớp được đúng căn nhà, đang lấy căn gần tọa độ nhất. Nhìn hình xem mũi tên có nằm trên đúng căn không.',conf_lo:'Không chắc: bản đồ không có hình căn nhà. Nên đo bằng la bàn tại chỗ.',
 near:'Số độ nằm sát ranh hai hướng ({b}). Nên đo lại tại chỗ.',corner:'Nhà góc đường. Cửa cũng có thể nhìn ra {r} ({d}°).',use_alt:'Cửa nhìn ra {r}',use_main:'Cửa nhìn ra {r}',
 cond:'Condo, townhouse, nhà sau (flag lot): cửa có thể quay vào sân chung chứ không ra đường. Nên đo tại chỗ.',
 adj:'Chỉnh tay:',flip:'Đảo 180°',on:'trên',
 att:'Ảnh vệ tinh Esri · đường và nhà OpenStreetMap',
 dirs:{N:'Bắc',NE:'Đông Bắc',E:'Đông',SE:'Đông Nam',S:'Nam',SW:'Tây Nam',W:'Tây',NW:'Tây Bắc'}},
en:{lbl:'Or paste an address / map link',lbl_s:'(Google Maps, Apple Maps, Zillow, Redfin)',ph:'961 S Jackson Ave, San Jose',go:'Find facing',
 cmp:'Measure with phone compass',cmp_use:'Use this number',cmp_stop:'Stop',cmp_wait:'Waiting for the compass… move the phone in a figure 8.',cmp_none:'This device has no compass. Use a phone, or paste an address above.',cmp_deny:'Compass not allowed. Go to Settings → Safari → Motion & Orientation Access and try again.',cmp_how:'Stand just inside the front door, back to the house, phone flat, top of the phone pointing out the door.',cmp_live:'Compass reads',
 busy:'Finding the home…',busy2:'Reading the map around the home…',
 e_empty:'Paste an address or map link above.',e_short:'Short links (maps.app.goo.gl) cannot be opened from this page. Open the link on your phone, tap the home, copy the address and paste it here.',
 e_geo:'Address not found. Try the full address: number, street, city, zip.',e_net:'The map service is busy or offline. Wait a moment and try again.',e_road:'No street found near the home on the map. Measure with a compass on site.',
 faces:'Faces',tru:'True bearing (map)',mag:'Magnetic (compass)',filled:'Filled in',
 conf_hi:'Fairly sure: the home and its front edge were found on the map.',conf_md:'Estimate: the exact home was not matched, using the building closest to the pin. Check the arrow sits on the right house.',conf_lo:'Not sure: the map has no outline for this home. Measure with a compass on site.',
 near:'This number is close to the line between two directions ({b}). Measure on site.',corner:'Corner lot. The door may face {r} instead ({d}°).',use_alt:'Door faces {r}',use_main:'Door faces {r}',
 cond:'Condo, townhouse or rear lot: the door may face a courtyard, not the street. Measure on site.',
 adj:'Adjust:',flip:'Flip 180°',on:'on',
 att:'Imagery Esri · streets and buildings OpenStreetMap',
 dirs:{N:'North',NE:'Northeast',E:'East',SE:'Southeast',S:'South',SW:'Southwest',W:'West',NW:'Northwest'}}
};
var DIR8=['N','NE','E','SE','S','SW','W','NW'];
function L(){var l;try{l=(typeof lang!=='undefined'&&lang)||localStorage.getItem('kl_lang')}catch(e){} return l==='en'?'en':(l==='vi'?'vi':(document.documentElement.lang==='en'?'en':'vi'))}
function tx(k,o){var s=T[L()][k];if(o)for(var p in o)s=s.split('{'+p+'}').join(o[p]);return s}
function mod(a,n){return ((a%n)+n)%n}
function dir8(d){return DIR8[Math.round(mod(d,360)/45)%8]}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- đọc input ---------- */
function parseInput(raw){
  var s=(raw||'').trim(), out={text:'',lat:null,lon:null,short:false};
  if(!s) return out;
  var urlM=s.match(/https?:\/\/\S+/i), url=urlM?urlM[0]:'', rest=s.replace(/https?:\/\/\S+/ig,' ').replace(/\s+/g,' ').trim();
  var dec=function(x){try{return decodeURIComponent(x.replace(/\+/g,' '))}catch(e){return x.replace(/\+/g,' ')}};
  if(url){
    var m;
    if((m=url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/))){out.lat=+m[1];out.lon=+m[2];}
    else if((m=url.match(/[?&](?:ll|sll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/))){out.lat=+m[1];out.lon=+m[2];}
    else if((m=url.match(/[?&](?:q|query|daddr|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/))){out.lat=+m[1];out.lon=+m[2];}
    if((m=url.match(/\/place\/([^/@?]+)/))) out.text=dec(m[1]);
    else if((m=url.match(/[?&](?:address|q|query|daddr|destination)=([^&#]+)/))&&!/^-?\d+\.\d+,/.test(dec(m[1]))) out.text=dec(m[1]);
    else if((m=url.match(/zillow\.com\/homedetails\/([^/]+)\//i))) out.text=m[1].replace(/-/g,' ').replace(/\s([A-Z]{2})\s(\d{5})$/,', $1 $2');
    else if((m=url.match(/redfin\.com\/([A-Z]{2})\/([^/]+)\/([^/]+)\/home/i))) out.text=m[3].replace(/-/g,' ').replace(/\s(\d{5})$/,'')+', '+m[2].replace(/-/g,' ')+', '+m[1]+(m[3].match(/(\d{5})$/)?' '+m[3].match(/(\d{5})$/)[1]:'');
    if(out.lat==null&&!out.text&&(m=url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/))){out.lat=+m[1];out.lon=+m[2];}
    if(out.lat==null&&!out.text&&/goo\.gl|maps\.app|g\.co\//i.test(url)) out.short=true;
  }
  if(!out.text&&rest){ var m2=rest.match(/^(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/); if(m2&&out.lat==null){out.lat=+m2[1];out.lon=+m2[2];} else if(!m2) out.text=rest; }
  if(out.text||out.lat!=null) out.short=false;
  return out;
}
var TYPES={avenue:'ave',av:'ave',street:'st',drive:'dr',road:'rd',lane:'ln',court:'ct',boulevard:'blvd',place:'pl',circle:'cir',terrace:'ter',parkway:'pkwy',expressway:'expy',highway:'hwy',square:'sq',trail:'trl',loop:'loop',way:'way',common:'cmn',commons:'cmn'};
var DIRW={north:'n',south:'s',east:'e',west:'w',northeast:'ne',northwest:'nw',southeast:'se',southwest:'sw'};
var TYPESET={ave:1,st:1,dr:1,rd:1,ln:1,ct:1,blvd:1,pl:1,cir:1,ter:1,pkwy:1,expy:1,hwy:1,sq:1,trl:1,loop:1,way:1,cmn:1};
function coreName(n){ var w=String(n||'').toLowerCase().replace(/[.,#]/g,' ').split(/\s+/).filter(Boolean).map(function(x){return TYPES[x]||DIRW[x]||x});
  while(w.length>1&&/^(n|s|e|w|ne|nw|se|sw)$/.test(w[0])) w.shift();
  while(w.length>1&&/^(n|s|e|w)$/.test(w[w.length-1])) w.pop();
  return w.join(' '); }
function splitAddr(t){ var m=String(t||'').match(/^\s*(\d+[A-Za-z]?)(?:-\d+)?\s+([^,]+)/); return m?{num:m[1],street:m[2]}:{num:null,street:null}; }

/* ---------- mạng ---------- */
function fetchJSON(url,opt,ms){ var c=('AbortController' in window)?new AbortController():null, to=setTimeout(function(){if(c)c.abort()},ms||20000);
  opt=opt||{}; if(c) opt.signal=c.signal;
  return fetch(url,opt).then(function(r){clearTimeout(to); if(!r.ok) throw new Error('http '+r.status); return r.json();}); }
function geocode(text){ var u=NOMI+'?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&viewbox=-122.6,38.1,-121.2,36.9&q='+encodeURIComponent(text);
  return fetchJSON(u,{headers:{'Accept-Language':'en'}}).then(function(a){ if(!a||!a.length) return null; var r=a[0], ad=r.address||{};
    return {lat:+r.lat,lon:+r.lon,num:ad.house_number||null,street:ad.road||null,kind:r.type,label:r.display_name}; }); }
function overpass(q){ var i=0; function go(){ return fetchJSON(OVP[i],{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}},25000)
  .catch(function(e){ i++; if(i<OVP.length) return go(); throw e; }); } return go(); }

/* ---------- hình học (mét, mặt phẳng quanh điểm gốc) ---------- */
function proj(o){ var k=Math.cos(o.lat*Math.PI/180); return function(p){return {x:(p.lon-o.lon)*111320*k,y:(p.lat-o.lat)*110540}}; }
function brg(dx,dy){ return mod(Math.atan2(dx,dy)*180/Math.PI,360); }
function adiff(a,b){ var d=Math.abs(mod(a-b,360)); return d>180?360-d:d; }
function centroid(pts){ var a=0,cx=0,cy=0,n=pts.length; for(var i=0;i<n;i++){var p=pts[i],q=pts[(i+1)%n],f=p.x*q.y-q.x*p.y;a+=f;cx+=(p.x+q.x)*f;cy+=(p.y+q.y)*f;}
  if(Math.abs(a)<1e-6){ var sx=0,sy=0; pts.forEach(function(p){sx+=p.x;sy+=p.y}); return {x:sx/n,y:sy/n}; } return {x:cx/(3*a),y:cy/(3*a)}; }
function inPoly(p,pts){ var c=false; for(var i=0,j=pts.length-1;i<pts.length;j=i++){var a=pts[i],b=pts[j]; if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)) c=!c;} return c; }
function nearOnLine(p,pts){ var best=null; for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1],vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy,t=l2?((p.x-a.x)*vx+(p.y-a.y)*vy)/l2:0; t=Math.max(0,Math.min(1,t));
  var q={x:a.x+t*vx,y:a.y+t*vy},d=Math.hypot(q.x-p.x,q.y-p.y); if(!best||d<best.d) best={d:d,x:q.x,y:q.y}; } return best; }
function snapEdge(c,pts,b0){ var best=null; for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy); if(len<3) continue;
  var nx=dy,ny=-dx,mx=(a.x+b.x)/2-c.x,my=(a.y+b.y)/2-c.y; if(nx*mx+ny*my<0){nx=-nx;ny=-ny;}
  var bb=brg(nx,ny),df=adiff(bb,b0); if(!best||df<best.df-3||(df<=best.df+3&&len>best.len)) best={b:bb,df:df,len:len}; }
  return best&&best.df<=30?best.b:null; }

/* ---------- tìm hướng ---------- */
function locate(inp){
  var p=Promise.resolve(null);
  if(inp.text) p=geocode(inp.text).catch(function(){return 'net'});
  return p.then(function(g){
    if(g==='net'&&inp.lat==null) throw {k:'e_net'};
    if(g==='net') g=null;
    var sa=splitAddr(inp.text);
    if(!g&&inp.lat==null){ if(sa.street&&inp.text.indexOf(',')>0){ return geocode(inp.text.replace(/^\s*\d+[A-Za-z]?\s+/,'')).then(function(g2){ if(!g2) throw {k:'e_geo'}; return {lat:g2.lat,lon:g2.lon,num:sa.num,street:sa.street,approx:true,label:inp.text}; }); } throw {k:'e_geo'}; }
    var o={lat:inp.lat!=null?inp.lat:g.lat,lon:inp.lon!=null?inp.lon:g.lon,pin:inp.lat!=null,num:(g&&g.num)||sa.num,street:(g&&g.street)||sa.street,label:inp.text||(inp.lat.toFixed(5)+', '+inp.lon.toFixed(5))};
    if(g&&!g.num&&sa.num) o.approx=true;
    return o; });
}
/* ---------- OpenFreeMap vector tiles (z14, CDN) — nguồn chính; Overpass dự phòng ---------- */
var OFM='https://tiles.openfreemap.org/planet', tileTpl=null;
function pbfRead(buf){ var b=new Uint8Array(buf), pos=0;
  function vint(){ var r=0,m=1,c; do{ c=b[pos++]; r+=(c&127)*m; m*=128; }while(c>=128); return r; }
  function msg(end,cb){ while(pos<end){ var k=vint(), f=k>>3, w=k&7, st;
    if(w===0){ cb(f,0,vint()); } else if(w===2){ var len=vint(); st=pos; pos+=len; cb(f,2,st,st+len); } else if(w===5){ cb(f,5,pos); pos+=4; } else if(w===1){ cb(f,1,pos); pos+=8; } else throw new Error('pbf'); } }
  function str(a,z){ return new TextDecoder().decode(b.subarray(a,z)); }
  function packed(a,z){ var save=pos,out=[]; pos=a; while(pos<z) out.push(vint()); pos=save; return out; }
  var layers=[];
  msg(b.length,function(f,w,a,z){ if(f!==3) return; var save=pos; pos=a; var L={name:'',keys:[],vals:[],feats:[],extent:4096};
    msg(z,function(f2,w2,a2,z2){
      if(f2===1) L.name=str(a2,z2); else if(f2===3) L.keys.push(str(a2,z2)); else if(f2===5) L.extent=a2;
      else if(f2===4){ var sv=pos,v=null; pos=a2; msg(z2,function(f3,w3,a3,z3){ if(f3===1) v=str(a3,z3); else if(f3===4||f3===5) v=a3; else if(f3===7) v=!!a3; else if(f3===3) v=new DataView(b.buffer,b.byteOffset+a3,8).getFloat64(0,true); else if(f3===2) v=new DataView(b.buffer,b.byteOffset+a3,4).getFloat32(0,true); }); pos=sv; L.vals.push(v); }
      else if(f2===2) L.feats.push([a2,z2]); });
    pos=save; layers.push(L); });
  function feature(L,fr){ var save=pos,F={tags:[],type:0,geom:[]}; pos=fr[0];
    msg(fr[1],function(f,w,a,z){ if(f===2) F.tags=packed(a,z); else if(f===3) F.type=a; else if(f===4) F.geom=packed(a,z); });
    pos=save; var props={}; for(var i=0;i<F.tags.length;i+=2) props[L.keys[F.tags[i]]]=L.vals[F.tags[i+1]];
    var rings=[],cur=null,x=0,y=0,g=F.geom,i2=0; while(i2<g.length){ var c=g[i2++],id=c&7,n=c>>3;
      if(id===7){ if(cur&&cur.length) cur.push(cur[0]); continue; }
      for(var j=0;j<n;j++){ var dx=g[i2++],dy=g[i2++]; x+=(dx>>>1)^-(dx&1); y+=(dy>>>1)^-(dy&1); if(id===1){ cur=[]; rings.push(cur); } cur.push([x,y]); } }
    return {props:props,type:F.type,rings:rings}; }
  return {layers:layers,feature:feature};
}
function tileData(o){
  var Z=14,n=1<<Z, fx=(o.lon+180)/360*n, lr=o.lat*Math.PI/180, fy=(1-Math.log(Math.tan(lr)+1/Math.cos(lr))/Math.PI)/2*n;
  var tx=Math.floor(fx),ty=Math.floor(fy),xs=[tx],ys=[ty]; if(fx-tx<.15) xs.push(tx-1); if(fx-tx>.85) xs.push(tx+1); if(fy-ty<.15) ys.push(ty-1); if(fy-ty>.85) ys.push(ty+1);
  var tp=tileTpl?Promise.resolve(tileTpl):fetchJSON(OFM,{},10000).then(function(j){tileTpl=j.tiles[0];return tileTpl;});
  return tp.then(function(tpl){ var jobs=[]; xs.forEach(function(x){ys.forEach(function(y){ jobs.push(fetchBuf(tpl.replace('{z}',Z).replace('{x}',x).replace('{y}',y)).then(function(buf){return {x:x,y:y,t:pbfRead(buf)}})); });});
    return Promise.all(jobs); }).then(function(tiles){
    var P=proj(o), blds=[], roads=[], addrs=[], ROADC={primary:1,secondary:1,tertiary:1,minor:1,trunk:1};
    tiles.forEach(function(T0){ T0.t.layers.forEach(function(L){ if(!/^(building|housenumber|transportation_name)$/.test(L.name)) return;
      var toLL=function(p){ var X=(T0.x+p[0]/L.extent)/n, Y=(T0.y+p[1]/L.extent)/n; return {lon:X*360-180,lat:Math.atan(Math.sinh(Math.PI*(1-2*Y)))*180/Math.PI}; };
      L.feats.forEach(function(fr){ var F=T0.t.feature(L,fr);
        if(L.name==='building'&&F.type===3){ F.rings.forEach(function(r,ri){ if(r.length<4) return; var pts=r.map(function(q){return P(toLL(q))}); var c=centroid(pts.slice(0,-1)); if(Math.hypot(c.x,c.y)>200) return;
          if(ri>0){ var a=0; for(var k=0;k<r.length-1;k++) a+=r[k][0]*r[k+1][1]-r[k+1][0]*r[k][1]; if(a<0) return; }
          blds.push({pts:pts,c:c,t:{}}); }); }
        else if(L.name==='housenumber'&&F.type===1){ F.rings.forEach(function(r){ var q=P(toLL(r[0])); if(Math.hypot(q.x,q.y)<450) addrs.push({way:false,p:q,t:{'addr:housenumber':String(F.props.housenumber)}}); }); }
        else if(L.name==='transportation_name'&&F.type===2&&F.props.name&&ROADC[F.props['class']]){ F.rings.forEach(function(r){ var pts=r.map(function(q){return P(toLL(q))}); if(nearOnLine({x:0,y:0},pts).d<400) roads.push({name:F.props.name,core:coreName(F.props.name),pts:pts}); }); }
      }); }); });
    return {blds:blds,roads:roads,addrs:addrs,src:'ofm'}; });
}
function fetchBuf(url){ var c=('AbortController' in window)?new AbortController():null, to=setTimeout(function(){if(c)c.abort()},12000);
  return fetch(url,c?{signal:c.signal}:{}).then(function(r){clearTimeout(to); if(!r.ok) throw new Error('http '+r.status); return r.arrayBuffer();}); }
function overpassData(o){
  var lat=o.lat.toFixed(6),lon=o.lon.toFixed(6),num=o.num?String(o.num).replace(/"/g,''):null;
  var q='[out:json][timeout:20];('+(num?'nw(around:250,'+lat+','+lon+')["addr:housenumber"="'+num+'"];':'')+
    'way(around:160,'+lat+','+lon+')["building"];'+
    'way(around:300,'+lat+','+lon+')["highway"~"^(residential|tertiary|secondary|primary|unclassified|living_street|trunk)$"]["name"];);out tags geom;';
  return overpass(q).then(function(js){
    var P=proj(o), els=js.elements||[], blds=[], roads=[], addrs=[];
    els.forEach(function(e){ var t=e.tags||{};
      if(e.type==='way'&&e.geometry){ var pts=e.geometry.map(P);
        if(t.highway) roads.push({name:t.name,core:coreName(t.name),pts:pts});
        else if(pts.length>3){ blds.push({pts:pts,c:centroid(pts.slice(0,-1)),t:t}); }
        if(t['addr:housenumber']===num&&!t.highway) addrs.push({way:true,pts:pts,t:t}); }
      else if(e.type==='node'&&t['addr:housenumber']===num) addrs.push({way:false,p:P({lat:e.lat,lon:e.lon}),t:t}); });
    return {blds:blds,roads:roads,addrs:addrs,src:'ovp'}; });
}
function getData(o){ return tileData(o).then(function(d){ if(!d.roads.length&&!d.blds.length) throw new Error('empty'); return d; })
  .catch(function(){ return overpassData(o); }).catch(function(){ throw {k:'e_net'}; }); }
function analyse(o){
  var num=o.num?String(o.num):null;
  return getData(o).then(function(D){
    var P=proj(o), blds=D.blds, roads=D.roads, want=o.street?coreName(o.street):null;
    var addrs=D.addrs.filter(function(a){return a.t['addr:housenumber']===num});
    /* căn nhà */
    var house=null, conf='md', origin={x:0,y:0};
    var am=addrs.filter(function(a){return !want||!a.t['addr:street']||coreName(a.t['addr:street'])===want});
    if(am.length){ am.sort(function(a,b){var pa=a.way?centroid(a.pts):a.p,pb=b.way?centroid(b.pts):b.p;return Math.hypot(pa.x,pa.y)-Math.hypot(pb.x,pb.y)});
      var a=am[0]; if(a.way&&a.pts.length>3){house={pts:a.pts,c:centroid(a.pts.slice(0,-1))};conf='hi';}
      else{ var ap=a.way?centroid(a.pts):a.p; var hb=blds.filter(function(b){return inPoly(ap,b.pts)})[0]||blds.filter(function(b){return Math.hypot(b.c.x-ap.x,b.c.y-ap.y)<35}).sort(function(x,y){return Math.hypot(x.c.x-ap.x,x.c.y-ap.y)-Math.hypot(y.c.x-ap.x,y.c.y-ap.y)})[0];
        if(hb){house=hb;conf=inPoly(ap,hb.pts)?'hi':'md';} else {origin=ap;conf='lo';} } }
    if(!house&&conf!=='lo'){ var inb=blds.filter(function(b){return inPoly(origin,b.pts)})[0];
      if(inb){house=inb;conf=o.pin?'hi':'md';}
      else{ var nb=blds.slice().sort(function(x,y){return Math.hypot(x.c.x,x.c.y)-Math.hypot(y.c.x,y.c.y)})[0]; if(nb&&Math.hypot(nb.c.x,nb.c.y)<45){house=nb;conf='md';} else conf='lo'; } }
    if(o.approx&&conf==='hi') conf='md';
    var c=house?house.c:origin;
    if(!roads.length) throw {k:'e_road'};
    /* đường */
    var byName={}; roads.forEach(function(r){var n=nearOnLine(c,r.pts); if(!n) return; var k=r.core; if(!byName[k]||n.d<byName[k].d) byName[k]={d:n.d,x:n.x,y:n.y,name:r.name,core:k};});
    var list=Object.keys(byName).map(function(k){return byName[k]}).sort(function(a,b){return a.d-b.d});
    var main=(want&&byName[want])||list[0]; if(want&&!byName[want]&&conf==='hi') conf='md';
    function face(r){ var b=brg(r.x-c.x,r.y-c.y); var s=house?snapEdge(c,house.pts,b):null; return s!=null?s:b; }
    var res={tru:face(main),road:main.name,conf:conf,c:c,house:house,P:P,o:o};
    var alt=list.filter(function(r){return r.core!==main.core&&r.d<=Math.max(main.d+15,main.d*1.6)&&r.d<=45})[0];
    if(alt){ var ab=face(alt); if(adiff(ab,res.tru)>30) res.alt={tru:ab,road:alt.name}; }
    res.cond=!!(house&&/apartments|condominium|terrace|townhouse/.test(house.t&&house.t.building||''));
    return res; });
}

/* ---------- hình vệ tinh ---------- */
function mapHTML(res,tru){
  var Z=19, W=280, o=res.o, k=Math.cos(o.lat*Math.PI/180);
  var lat=o.lat+res.c.y/110540, lon=o.lon+res.c.x/(111320*k);
  var n=Math.pow(2,Z), X=(lon+180)/360*n, lr=lat*Math.PI/180, Y=(1-Math.log(Math.tan(lr)+1/Math.cos(lr))/Math.PI)/2*n;
  var px=X*256, py=Y*256, x0=px-W/2, y0=py-W/2, tx0=Math.floor(x0/256), ty0=Math.floor(y0/256), h='';
  for(var ty=ty0;ty<=Math.floor((y0+W)/256);ty++) for(var tx=tx0;tx<=Math.floor((x0+W)/256);tx++)
    h+='<img alt="" onerror="this.style.visibility=\'hidden\'" src="'+TILE+Z+'/'+ty+'/'+tx+'" style="position:absolute;left:'+Math.round(tx*256-x0)+'px;top:'+Math.round(ty*256-y0)+'px;width:256px;height:256px">';
  var mpp=156543.03*k/n, poly='';
  if(res.house){ poly=res.house.pts.map(function(p){return ((p.x-res.c.x)/mpp+W/2).toFixed(1)+','+(W/2-(p.y-res.c.y)/mpp).toFixed(1)}).join(' '); }
  var a=tru*Math.PI/180, L=Math.min(110,W/2-18), ex=W/2+L*Math.sin(a), ey=W/2-L*Math.cos(a);
  var svg='<svg width="'+W+'" height="'+W+'" viewBox="0 0 '+W+' '+W+'" style="position:absolute;left:0;top:0">'+
    (poly?'<polygon points="'+poly+'" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="1.5"/>':'')+
    '<defs><marker id="klhA" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#E8B04B"/></marker></defs>'+
    '<line x1="'+W/2+'" y1="'+W/2+'" x2="'+ex.toFixed(1)+'" y2="'+ey.toFixed(1)+'" stroke="#E8B04B" stroke-width="4" marker-end="url(#klhA)"/>'+
    '<circle cx="'+W/2+'" cy="'+W/2+'" r="5" fill="#E8B04B" stroke="#fff" stroke-width="1.5"/>'+
    '<g transform="translate('+(W-22)+',22)"><circle r="13" fill="rgba(0,0,0,.55)"/><path d="M0,-9 L4,2 L0,0 L-4,2 z" fill="#fff"/><text y="10" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif">'+(L_()==='vi'?'B':'N')+'</text></g></svg>';
  return '<div class="klh-map" style="width:'+W+'px;height:'+W+'px">'+h+svg+'</div>';
}
function L_(){return L()}

/* ---------- la bàn ---------- */
function startCompass(onv,onerr){
  var got=false, h=null, stop;
  function ios(e){ if(typeof e.webkitCompassHeading==='number'){got=true;onv(e.webkitCompassHeading);} }
  function abs(e){ if(e.absolute!==false&&typeof e.alpha==='number'){got=true;onv(mod(360-e.alpha,360));} }
  function attach(){ if('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute',abs); window.addEventListener('deviceorientation',ios);
    h=setTimeout(function(){ if(!got) onerr('cmp_none'); },3500); }
  stop=function(){ clearTimeout(h); window.removeEventListener('deviceorientationabsolute',abs); window.removeEventListener('deviceorientation',ios); };
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(function(s){ if(s==='granted') attach(); else onerr('cmp_deny'); }).catch(function(){onerr('cmp_deny')}); }
  else if(typeof DeviceOrientationEvent!=='undefined') attach(); else onerr('cmp_none');
  return stop;
}

/* ---------- giao diện ---------- */
var CSS='.klh{display:grid;gap:8px;margin:2px 0 4px}.klh .klh-row{display:flex;gap:8px}.klh .klh-row .ctl{flex:1;min-width:0}.klh .klh-row .ctl input{font-size:16px}'+
'.klh .klh-go{flex:0 0 auto}.klh .klh-btn{border:1px solid var(--brass,#B8975A);background:var(--brass,#B8975A);color:#fff;font:inherit;font-size:14px;font-weight:500;padding:0 14px;border-radius:10px;cursor:pointer;white-space:nowrap}'+
'.klh .klh-btn[disabled]{opacity:.6;cursor:wait}.klh .klh-sm{border:1px solid var(--line,#E5DFD3);background:transparent;color:var(--fg,#2B2925);font:inherit;font-size:13px;padding:6px 11px;border-radius:999px;cursor:pointer}'+
'.klh .klh-sm.on{border-color:var(--brass,#B8975A);color:var(--brass,#B8975A)}.klh .klh-out{border:1px solid var(--line,#E5DFD3);background:var(--panel,#fff);border-radius:12px;padding:12px;display:grid;gap:9px;font-size:14px;line-height:1.45}'+
'.klh .klh-map{position:relative;overflow:hidden;border-radius:10px;justify-self:center;background:#222;max-width:100%}.klh .klh-big{font-size:20px;font-weight:500}.klh .klh-num{display:flex;gap:16px;flex-wrap:wrap;font-variant-numeric:tabular-nums}'+
'.klh .klh-num span{color:var(--muted,#7A7468);font-size:12px;display:block}.klh .klh-note{font-size:12px;color:var(--muted,#7A7468)}.klh .klh-warn{font-size:13px;color:var(--warn,#A0522D)}.klh .klh-ok{font-size:13px;color:var(--ok,#4F7A4F)}'+
'.klh .klh-adj{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.klh .klh-live{font-size:40px;font-variant-numeric:tabular-nums;line-height:1.1}';

function mount(cfg){
  if(!cfg||!cfg.after) return;
  if(!document.getElementById('klhCss')){var st=document.createElement('style');st.id='klhCss';st.textContent=CSS;document.head.appendChild(st);}
  var box=document.createElement('div'); box.className='klh'; cfg.after.parentNode.insertBefore(box,cfg.after.nextSibling);
  var cur=null, curTru=null, stopC=null, live=null, lastAddr='';
  try{lastAddr=localStorage.getItem(LS)||''}catch(e){}
  function toRef(tru){ return cfg.ref==='true'?Math.round(mod(tru,360)):Math.round(mod(tru-DECL,360)*2)/2; }
  function shell(){
    box.innerHTML='<label class="klh-lbl" style="font-size:13px;font-weight:500;color:var(--muted)">'+tx('lbl')+' <small style="font-weight:400">'+tx('lbl_s')+'</small></label>'+
      '<div class="klh-row"><div class="ctl"><input type="text" class="klh-in" autocomplete="street-address" enterkeyhint="search" placeholder="'+esc(tx('ph'))+'"></div><button type="button" class="klh-btn klh-go">'+tx('go')+'</button></div>'+
      (cfg.compass?'<div><button type="button" class="klh-sm klh-cmp">🧭 '+tx('cmp')+'</button></div>':'')+'<div class="klh-res"></div>';
    var inp=box.querySelector('.klh-in'); inp.value=lastAddr;
    box.querySelector('.klh-go').onclick=run; inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();run();}});
    if(cfg.compass) box.querySelector('.klh-cmp').onclick=compass; }
  function out(h){ box.querySelector('.klh-res').innerHTML=h?'<div class="klh-out">'+h+'</div>':''; }
  function apply(tru,src){ curTru=mod(tru,360); var v=toRef(curTru); var msg=cfg.apply?cfg.apply(v):''; return msg; }
  function render(){
    var r=cur, tru=curTru, mag=mod(tru-DECL,360), d=dir8(cfg.ref==='true'?tru:mag), msg=cfg.apply?cfg.apply(toRef(tru)):'';
    var ref=cfg.ref==='true'?tru:mag, edge=mod(ref+22.5,45); var near=(edge<4||edge>41);
    var b=near?(T[L()].dirs[dir8(ref-4)]+' / '+T[L()].dirs[dir8(ref+4)]):'';
    var h='';
    if(r.house||r.o) h+=mapHTML(r,tru);
    h+='<div class="klh-big">'+tx('faces')+' '+T[L()].dirs[d]+'</div>'+
      '<div class="klh-num"><div><span>'+tx('tru')+'</span>'+Math.round(tru)+'°</div><div><span>'+tx('mag')+'</span>'+(Math.round(mag*2)/2)+'°</div></div>'+
      (msg?'<div class="klh-ok">✓ '+tx('filled')+': '+esc(msg)+'</div>':'')+
      '<div class="klh-note">'+esc(r.label||'')+(r.road?' · '+tx('on')+' '+esc(r.road):'')+'</div>'+
      '<div class="'+(r.conf==='hi'?'klh-note':'klh-warn')+'">'+tx('conf_'+r.conf)+'</div>';
    if(near) h+='<div class="klh-warn">'+tx('near',{b:b})+'</div>';
    if(r.alt){ var onAlt=adiff(tru,r.alt.tru)<adiff(tru,r.tru0);
      h+='<div class="klh-warn">'+tx('corner',{r:esc(onAlt?r.road0:r.alt.road),d:Math.round(onAlt?r.tru0:r.alt.tru)})+'</div>'+
        '<div class="klh-adj"><button type="button" class="klh-sm'+(onAlt?'':' on')+'" data-set="'+r.tru0+'">'+tx('use_main',{r:esc(r.road0)})+'</button><button type="button" class="klh-sm'+(onAlt?' on':'')+'" data-set="'+r.alt.tru+'">'+tx('use_alt',{r:esc(r.alt.road)})+'</button></div>'; }
    if(r.cond) h+='<div class="klh-warn">'+tx('cond')+'</div>';
    h+='<div class="klh-adj"><span class="klh-note">'+tx('adj')+'</span><button type="button" class="klh-sm" data-add="-5">−5°</button><button type="button" class="klh-sm" data-add="5">+5°</button><button type="button" class="klh-sm" data-add="180">'+tx('flip')+'</button></div>'+
      '<div class="klh-note" style="font-size:11px">'+tx('att')+'</div>';
    out(h);
    box.querySelectorAll('[data-add]').forEach(function(bt){bt.onclick=function(){curTru=mod(curTru+ +bt.getAttribute('data-add'),360);render();}});
    box.querySelectorAll('[data-set]').forEach(function(bt){bt.onclick=function(){curTru=+bt.getAttribute('data-set');render();}});
  }
  function run(){
    if(stopC){stopC();stopC=null;}
    var raw=box.querySelector('.klh-in').value, inp=parseInput(raw), go=box.querySelector('.klh-go');
    if(inp.short){ out('<div class="klh-warn">'+tx('e_short')+'</div>'); return; }
    if(!inp.text&&inp.lat==null){ out('<div class="klh-warn">'+tx('e_empty')+'</div>'); return; }
    try{localStorage.setItem(LS,raw.trim()); lastAddr=raw.trim();}catch(e){}
    go.disabled=true; out('<div class="klh-note">'+tx('busy')+'</div>');
    locate(inp).then(function(o){ out('<div class="klh-note">'+tx('busy2')+'</div>'); return analyse(o); })
    .then(function(r){ r.tru0=r.tru; r.road0=r.road; r.label=r.o.label; cur=r; curTru=r.tru; render(); })
    .catch(function(e){ out('<div class="klh-warn">'+tx((e&&e.k)||'e_net')+'</div>'); })
    .then(function(){go.disabled=false;});
  }
  function compass(){
    if(stopC){stopC();stopC=null;out('');return;}
    out('<div class="klh-note">'+tx('cmp_how')+'</div><div class="klh-live">—</div><div class="klh-note klh-cw">'+tx('cmp_wait')+'</div><div class="klh-adj"><button type="button" class="klh-btn klh-use" style="padding:9px 14px">'+tx('cmp_use')+'</button><button type="button" class="klh-sm klh-stop">'+tx('cmp_stop')+'</button></div>');
    live=null;
    box.querySelector('.klh-stop').onclick=function(){if(stopC){stopC();stopC=null;}out('');};
    box.querySelector('.klh-use').onclick=function(){ if(live==null) return; var mag=live; if(stopC){stopC();stopC=null;}
      var tru=mod(mag+DECL,360); cur={conf:'hi',label:'',road:'',cmp:true}; curTru=tru;
      var m=mod(tru-DECL,360), d=dir8(cfg.ref==='true'?tru:m), msg=cfg.apply?cfg.apply(toRef(tru)):'';
      out('<div class="klh-big">'+tx('faces')+' '+T[L()].dirs[d]+'</div><div class="klh-num"><div><span>'+tx('mag')+'</span>'+(Math.round(m*2)/2)+'°</div><div><span>'+tx('tru')+'</span>'+Math.round(tru)+'°</div></div>'+(msg?'<div class="klh-ok">✓ '+tx('filled')+': '+esc(msg)+'</div>':'')); };
    stopC=startCompass(function(v){ live=Math.round(v*2)/2; var el=box.querySelector('.klh-live'); if(el){el.textContent=live+'° '+T[L()].dirs[dir8(v)]; var w=box.querySelector('.klh-cw'); if(w) w.textContent='';} },
      function(k){ if(stopC){stopC();stopC=null;} out('<div class="klh-warn">'+tx(k)+'</div>'); });
  }
  shell();
  var lb=document.getElementById('langBtn'); if(lb) lb.addEventListener('click',function(){setTimeout(function(){ var v=box.querySelector('.klh-in').value; lastAddr=v; if(stopC){stopC();stopC=null;} var keep=cur; shell(); if(keep&&!keep.cmp){cur=keep;render();} },0);});
  return {run:run};
}
function fire(el){ if(!el) return; ['input','change'].forEach(function(t){el.dispatchEvent(new Event(t,{bubbles:true}))}); }
window.KLHuong={en:function(){return L()==='en'},mount:mount,parseInput:parseInput,coreName:coreName,dir8:dir8,fire:fire,DECL:DECL,_analyse:analyse,_locate:locate};
})();
