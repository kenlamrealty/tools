"""Idempotent, additive: wire cards in /home/claude/forms/cards into hub (frm), sitemap, T402 (links + panel items). Never removes others' entries."""
import json, re, glob, html
R='/home/claude/tools'; e=lambda s: html.escape(s, quote=True)
cards=sorted((json.load(open(f)) for f in glob.glob('/home/claude/forms/cards/*.json')), key=lambda c:c['code'])
p=f'{R}/index.html'; s=open(p).read()
for c in cards:
    if f'href="{c["href"]}"' in s: continue
    k=f'{c["code"]} {c["form"]} {c["vi"]} {c["en"]} {c["vi_desc"]} {c["en_desc"]} Giải nghĩa Forms Forms explained'
    s=s.replace('  <p class="empty"', f'    <a class="card" href="{c["href"]}" data-g="frm luat" data-k="{e(k)}">\n      <span class="code">{c["code"]}</span>\n      <span class="ct" data-vi="{e(c["vi"])}" data-en="{e(c["en"])}">{e(c["vi"])}</span>\n      <span class="cl" data-vi="{e(c["vi_desc"])}" data-en="{e(c["en_desc"])}">{e(c["vi_desc"])}</span>\n      <span class="cg" data-i="g_frm">Giải nghĩa Forms</span>\n    </a>\n  <p class="empty"',1)
open(p,'w').write(s)
p=f'{R}/sitemap.xml'; s=open(p).read()
for c in cards:
    u=f'https://tools.kenlamrealty.com{c["href"]}'
    if u not in s: s=s.replace('</urlset>',f'  <url><loc>{u}</loc></url>\n</urlset>')
open(p,'w').write(s)
p=f'{R}/t402/index.html'; s=open(p).read()
m=re.search(r'const DATA = (\[.*?\]);\n',s,re.S); data=json.loads(m.group(1)); L={c['form']:c for c in cards}
for d in data:
    if d['code'] in L and not d.get('tool'): d['tool']=L[d['code']]['href']; d['tool_code']=L[d['code']]['code']
s=s[:m.start(1)]+json.dumps(data,ensure_ascii=False)+s[m.end(1):]
for c in cards:
    if f'<li><a href="{c["href"]}">' in s: continue
    s=s.replace('</ul></section>', f'<li><a href="{c["href"]}"><b>{c["form"]}</b>{e(c["vi"])}</a></li></ul></section>',1) if 'id="deep"' in s else s
open(p,'w').write(s); print('cards',len(cards))
