#!/usr/bin/env python3
"""Idempotent: wire T420–T439 form tools into the hub, sitemap and T402 library."""
import json, re, glob, html, os
R = '/home/claude/tools'
cards = sorted((json.load(open(f)) for f in glob.glob('/home/claude/forms/cards/*.json')), key=lambda c: c['code'])
cards = [c for c in cards if os.path.exists(f"{R}{c['href']}index.html")]
e = lambda s: html.escape(s, quote=True)

# ---------- hub index.html ----------
p = f'{R}/index.html'; s = open(p).read()
if 'data-g="frm"' not in s.split('<div class="cards"')[0]:
    s = s.replace('data-g="luat" data-i="g_luat">Luật & Giấy tờ</button>',
                  'data-g="luat" data-i="g_luat">Luật & Giấy tờ</button>\n    <button type="button" class="chip" aria-pressed="false" data-g="frm" data-i="g_frm">Giải nghĩa Forms</button>', 1)
if '"g_frm"' not in s:
    s = s.replace('"g_luat": "Luật & Giấy tờ"}', '"g_luat": "Luật & Giấy tờ", "g_frm": "Giải nghĩa Forms"}', 1)
    s = s.replace('"g_luat": "Legal & Paperwork"}', '"g_luat": "Legal & Paperwork", "g_frm": "Forms explained"}', 1)
if "forms:'frm'" not in s:
    s = s.replace("const HG={", "const HG={forms:'frm','giai-nghia-forms':'frm',", 1)
# T402 joins the forms group as its start page
s = s.replace('<a class="card" href="/t402/" data-g="luat"', '<a class="card" href="/t402/" data-g="luat frm"', 1)
for c in cards:
    if f'href="{c["href"]}"' in s: continue
    k = f'{c["code"]} {c["form"]} {c["vi"]} {c["en"]} {c["vi_desc"]} {c["en_desc"]} Giải nghĩa Forms Forms explained'
    card = (f'    <a class="card" href="{c["href"]}" data-g="frm luat" data-k="{e(k)}">\n'
            f'      <span class="code">{c["code"]}</span>\n'
            f'      <span class="ct" data-vi="{e(c["vi"])}" data-en="{e(c["en"])}">{e(c["vi"])}</span>\n'
            f'      <span class="cl" data-vi="{e(c["vi_desc"])}" data-en="{e(c["en_desc"])}">{e(c["vi_desc"])}</span>\n'
            f'      <span class="cg" data-i="g_frm">Giải nghĩa Forms</span>\n    </a>\n')
    s = s.replace('  <p class="empty"', card + '  <p class="empty"', 1)
open(p, 'w').write(s)

# ---------- sitemap ----------
p = f'{R}/sitemap.xml'; s = open(p).read()
for c in cards:
    u = f'https://tools.kenlamrealty.com{c["href"]}'
    if u not in s: s = s.replace('</urlset>', f'  <url><loc>{u}</loc></url>\n</urlset>')
open(p, 'w').write(s)

# ---------- T402: link each form to its deep tool + panel ----------
p = f'{R}/t402/index.html'; s = open(p).read()
m = re.search(r'const DATA = (\[.*?\]);\n', s, re.S); data = json.loads(m.group(1))
links = {c['form']: c for c in cards}
links_extra = {'RPA': {'code': 'T401', 'href': '/t401/', 'vi': 'Đọc Hợp Đồng RPA Từng Bước'}}
for d in data:
    c = links.get(d['code']) or links_extra.get(d['code'])
    if c: d['tool'] = c['href']; d['tool_code'] = c['code']
s = s[:m.start(1)] + json.dumps(data, ensure_ascii=False) + s[m.end(1):]
if 'class="deep"' not in s:
    s = s.replace('.empty{padding:40px 0;color:var(--muted)}',
      '.empty{padding:40px 0;color:var(--muted)}\n.deep{display:inline-block;margin-top:4px;font-weight:600;color:var(--accent)}\n.has{font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--accent);border:1px solid currentColor;border-radius:999px;padding:1px 7px;margin-left:6px;vertical-align:middle}\n.mlist{margin:18px 0 0;padding:16px 18px;border:1px solid var(--rule);border-radius:12px}\n.mlist h2{font-size:16px;margin:0 0 10px}\n.mlist ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}\n.mlist a{color:var(--ink);text-decoration:none}.mlist b{color:var(--accent);margin-right:6px}', 1)
    s = s.replace('${esc(d.ten_en)}</span></span>', '${esc(d.ten_en)}</span></span>${d.tool?`<span class="has">CHI TIẾT</span>`:""}', 1)
    s = s.replace('${d.luu_y?`<p class="tip"><span class="lbl">Cẩn thận</span>${esc(d.luu_y)}</p>`:""}</div>',
      '${d.luu_y?`<p class="tip"><span class="lbl">Cẩn thận</span>${esc(d.luu_y)}</p>`:""}${d.tool?`<p><a class="deep" href="${d.tool}">Giải nghĩa từng đoạn + tool + video 45 giây (${esc(d.tool_code)}) →</a></p>`:""}</div>', 1)
    # deep-link: /t402/#RIPA opens that form
    s = s.replace('document.getElementById("q").addEventListener("input", render);\nrender();',
      'document.getElementById("q").addEventListener("input", render);\nconst h0=decodeURIComponent(location.hash.slice(1)); if(h0){document.getElementById("q").value=h0;}\nrender();', 1)
panel_items = ''.join(f'<li><a href="{c["href"]}"><b>{c["form"]}</b>{e(c["vi"])}</a></li>'
                      for c in [links_extra['RPA'] | {'form': 'RPA'}] + sorted(cards, key=lambda c: c['form']))
panel = f'<section class="mlist" id="deep"><h2>Form có giải nghĩa từng đoạn, tool và video 45 giây</h2><ul>{panel_items}</ul></section>'
s = re.sub(r'<section class="mlist" id="deep">.*?</section>', '', s, flags=re.S)
s = s.replace('để tìm.</p>\n</header>', 'để tìm.</p>\n  ' + panel + '\n</header>', 1)
s = re.sub(r'Cập nhật: \d\d/\d\d/\d{4}', 'Cập nhật: 06/11/2026', s)
open(p, 'w').write(s)
print('cards wired:', [c['code'] for c in cards])
