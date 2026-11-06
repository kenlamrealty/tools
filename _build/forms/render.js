// Usage: node render.js <script.json> <out.mp4>
// Renders each scene to a 2160x3840 PNG, then ffmpeg zoom + fade, concat to 1080x1920 30fps H.264.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const F = path.join(process.env.FONT_DIR || path.join(__dirname, 'node_modules'), '@fontsource/be-vietnam-pro/files');
const font = w => ['latin', 'vietnamese', 'latin-ext'].map(s => {
  const p = `${F}/be-vietnam-pro-${s}-${w}-normal.woff2`;
  return fs.existsSync(p) ? `@font-face{font-family:BVP;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(p).toString('base64')}) format('woff2')}` : '';
}).join('');
const esc = s => String(s || '').replace(/(\d)-(\d)/g, '$1\u2011$2').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function html(sc, i, n, d) {
  const last = i === n - 1, first = i === 0;
  const bg = last ? '#1C1A17' : '#FBF9F4', fg = last ? '#F1ECE2' : '#2B2925', br = last ? '#D2B07A' : '#B8955A';
  const dots = Array.from({ length: n }, (_, k) => `<i style="background:${k <= i ? br : (last ? '#3A352E' : '#E6DFD2')}"></i>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>${font(500)}${font(700)}${font(800)}
*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:${bg};color:${fg};font-family:BVP,sans-serif}
.w{position:absolute;inset:0;padding:140px 96px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;font-weight:700;font-size:34px;letter-spacing:.04em;color:${br};text-transform:uppercase}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:44px}
.form{font-weight:800;font-size:${first ? 210 : 0}px;line-height:1;color:${br};letter-spacing:-.02em}
.k{display:inline-block;align-self:flex-start;font-weight:700;font-size:40px;padding:14px 30px;border-radius:999px;background:${last ? '#302A20' : '#F3EBDC'};color:${br}}
.h{overflow-wrap:anywhere;font-weight:800;font-size:${(sc.head || '').length > 26 ? 92 : 112}px;line-height:1.12;letter-spacing:-.01em}
.b{font-weight:500;font-size:56px;line-height:1.38;color:${last ? '#D9D1C3' : '#4A463F'}}
.bar{height:6px;width:180px;background:${br};border-radius:3px}
.dots{display:flex;gap:14px}.dots i{flex:1;height:10px;border-radius:5px}
.ft{margin-top:44px;display:flex;justify-content:space-between;font-weight:700;font-size:34px;color:${last ? '#A69D8E' : '#7A7266'}}
</style><div class="w"><div class="top"><span>Giải nghĩa Forms</span><span>${esc(d.code)}</span></div>
<div class="mid">${first ? `<div class="form">${esc(d.form)}</div>` : ''}<span class="k">${esc(first ? d.title : sc.kicker)}</span><div class="bar"></div>
<div class="h">${esc(sc.head)}</div>${sc.body ? `<div class="b">${esc(sc.body)}</div>` : ''}</div>
<div class="dots">${dots}</div><div class="ft"><span>Ken Lam · DRE #01401822</span><span>kenlamrealty.com/tools</span></div></div>`;
}

(async () => {
  const [, , inJson, out] = process.argv;
  const d = JSON.parse(fs.readFileSync(inJson, 'utf8'));
  const tmp = fs.mkdtempSync(require('os').tmpdir()+'/fr-');
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  const n = d.scenes.length, parts = [];
  for (let i = 0; i < n; i++) {
    await pg.setContent(html(d.scenes[i], i, n, d), { waitUntil: 'load' });
    await pg.evaluate(async () => { await document.fonts.ready;
      const h = document.querySelector('.h'); let f = parseFloat(getComputedStyle(h).fontSize);
      const fits = () => [...h.textContent.split(/\s+/)].every(w => { const r = document.createElement('span'); r.textContent = w; r.style.cssText = 'position:absolute;white-space:nowrap;font:inherit'; h.appendChild(r); const ok = r.offsetWidth <= h.clientWidth; r.remove(); return ok; });
      while (!fits() && f > 48) { f -= 4; h.style.fontSize = f + 'px'; } });
    const png = `${tmp}/s${i}.png`; await pg.screenshot({ path: png });
    const secs = d.scenes[i].secs, fr = Math.round(secs * 30), mp = `${tmp}/s${i}.mp4`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '30', '-i', png, '-frames:v', String(fr),
      '-vf', `zoompan=z='1+0.035*on/${fr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,fade=in:0:9,fade=out:${fr - 9}:9,format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', mp]);
    parts.push(mp);
  }
  await b.close();
  fs.writeFileSync(`${tmp}/list.txt`, parts.map(p => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${tmp}/list.txt`, '-c', 'copy', '-movflags', '+faststart', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ok', out);
})().catch(e => { console.error(e); process.exit(1); });
