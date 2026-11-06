// node render.js <script.json> <out.mp4>
// Renders a 1080x1920 explainer video: one PNG per scene (Playwright), then ffmpeg with fades + slow zoom.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [,, jsonPath, outPath] = process.argv;
const S = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const fm = 'file://' + path.join(__dirname, 'node_modules/@fontsource');
const css = ['be-vietnam-pro/400.css','be-vietnam-pro/500.css','be-vietnam-pro/700.css','cormorant-garamond/500.css']
  .map(f => `<link rel="stylesheet" href="${fm}/${f}">`).join('');
const esc = t => String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
function page(sc, i, n) {
  const dots = Array.from({length:n},(_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');
  const last = i === n-1, first = i === 0;
  return `<!doctype html><html><head><meta charset="utf-8">${css}<style>
  *{box-sizing:border-box;margin:0}
  body{width:1080px;height:1920px;background:#FBF9F4;color:#2B2925;font-family:'Be Vietnam Pro';display:flex;flex-direction:column;padding:120px 96px 110px;position:relative;overflow:hidden}
  body:before{content:"";position:absolute;right:-260px;top:-260px;width:760px;height:760px;border-radius:50%;background:#F3EBDC}
  body:after{content:"";position:absolute;left:-180px;bottom:-220px;width:520px;height:520px;border-radius:50%;border:2px solid #E6D6B8}
  .top{position:relative;display:flex;justify-content:space-between;align-items:center;font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:#B8955A;font-weight:500}
  .code{border:2px solid #B8955A;border-radius:999px;padding:10px 26px;letter-spacing:.08em}
  .form{position:relative;margin-top:44px;font-size:34px;color:#7A7468;font-weight:500;line-height:1.35}
  .mid{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;gap:56px}
  .n{font-size:56px;font-weight:500;color:#B8955A;letter-spacing:.1em}
  .big{font-weight:700;font-size:${first?112:100}px;line-height:1.12;letter-spacing:-.01em}
  .small{font-size:52px;line-height:1.45;color:#4A463F}
  .last .big{color:#B8955A}
  .dots{position:relative;display:flex;gap:14px;margin-bottom:40px}.dots i{flex:1;height:8px;border-radius:9px;background:#E6E0D3}.dots i.on{background:#B8955A}
  .foot{position:relative;font-size:34px;color:#7A7468;display:flex;justify-content:space-between}
  .foot b{color:#2B2925;font-weight:600}
  </style></head><body class="${last?'last':''}">
  <div class="top"><span>Ken Lam · Giải nghĩa form</span><span class="code">${esc(S.code)}</span></div>
  <div class="form">${esc(S.title_vi)}</div>
  <div class="mid">${first||last?'':`<div class="n">${String(i).padStart(2,'0')}</div>`}<div class="big">${esc(sc.big)}</div><div class="small">${esc(sc.small)}</div></div>
  <div class="dots">${dots}</div>
  <div class="foot"><b>tools.kenlamrealty.com</b><span>DRE #01401822</span></div>
  </body></html>`;
}
(async () => {
  const tmp = fs.mkdtempSync(path.join(process.env.VTMP || require('os').tmpdir(), 'v-'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const n = S.scenes.length;
  for (let i = 0; i < n; i++) {
    const f = path.join(tmp, `s${i}.html`); fs.writeFileSync(f, page(S.scenes[i], i, n));
    await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(tmp, `s${i}.png`) });
  }
  await b.close();
  const total = S.scenes.reduce((a, s) => a + s.sec, 0);
  const parts = [];
  S.scenes.forEach((s, i) => {
    const d = s.sec, fr = Math.round(d * 30);
    parts.push(path.join(tmp, `c${i}.mp4`));
    execFileSync('ffmpeg', ['-y','-v','error','-loop','1','-i',path.join(tmp,`s${i}.png`),
      '-vf', `scale=1188:-1,zoompan=z='1+0.05*on/${fr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${fr}:s=1080x1920:fps=30,fade=t=in:st=0:d=0.35,fade=t=out:st=${(d-0.35).toFixed(2)}:d=0.35,format=yuv420p`,
      '-t', String(d), '-c:v','libx264','-preset','veryfast','-crf','22', parts[i]]);
  });
  const list = path.join(tmp, 'l.txt'); fs.writeFileSync(list, parts.map(x => `file '${x}'`).join('\n'));
  execFileSync('ffmpeg', ['-y','-v','error','-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart', outPath]);
  console.log('ok', outPath, total + 's');
})();
