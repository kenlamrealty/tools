#!/usr/bin/env python3
"""Idempotent: wire T500–T509 into the existing 'frm' (Giải nghĩa Forms) group, sitemap, T402."""
import json, re, glob, html
R='/home/claude/tools'; e=lambda s: html.escape(s, quote=True)
LBL={'T500':'SXA','T501':'VLPA','T502':'Môi trường','T503':'Chì','T504':'Điện năng','T505':'Động đất','T506':'Tờ khai ĐĐ','T507':'Biên nhận','T508':'Mold','T509':'SB 800'}
MATCH={'T500':"Seller's Intent to Exchange Addendum",'T501':'Vacant Land Purchase Agreement','T502':'Residential Environmental Hazards',
 'T503':'Protect Your Family From Lead','T504':'Home Energy Rating','T505':"Homeowner's Guide to Earthquake Safety (2020",
 'T506':'Residential Earthquake Risk Disclosure Statement','T507':'Signature Page','T508':'Dampness and Mold for Renters','T509':'SB 800'}
cards=sorted((json.load(open(f)) for f in glob.glob('/home/claude/forms/cards/T50*.json')), key=lambda c:c['code'])
p=f'{R}/index.html'; s=open(p).read(); assert 'data-g="frm"' in s
for c in cards:
    if f'href="{c["href"]}"' in s: continue
    k=f'{c["code"]} {LBL[c["code"]]} {c["vi"]} {c["en"]} {c["vi_desc"]} {c["en_desc"]} Giải nghĩa Forms Forms explained'
    s=s.replace('  <p class="empty"', f'''    <a class="card" href="{c["href"]}" data-g="frm luat" data-k="{e(k)}">
      <span class="code">{c["code"]}</span>
      <span class="ct" data-vi="{e(c["vi"])}" data-en="{e(c["en"])}">{e(c["vi"])}</span>
      <span class="cl" data-vi="{e(c["vi_desc"])}" data-en="{e(c["en_desc"])}">{e(c["vi_desc"])}</span>
      <span class="cg" data-i="g_frm">Giải nghĩa Forms</span>
    </a>
  <p class="empty"''',1)
open(p,'w').write(s)
p=f'{R}/sitemap.xml'; s=open(p).read()
for c in cards:
    u=f'https://tools.kenlamrealty.com{c["href"]}'
    if u not in s: s=s.replace('</urlset>',f'  <url><loc>{u}</loc></url>\n</urlset>')
open(p,'w').write(s)
p=f'{R}/t402/index.html'; s=open(p).read()
m=re.search(r'const DATA = (\[.*?\]);\n',s,re.S); data=json.loads(m.group(1)); n=0
for d in data:
    for code,frag in MATCH.items():
        if frag in d['ten_en'] and not (code=='T501' and d['code']!='VLPA') and not (code=='T500' and d['code']!='SXA'):
            d['tool']='/'+code.lower()+'/'; d['tool_code']=code; n+=1
s=s[:m.start(1)]+json.dumps(data,ensure_ascii=False)+s[m.end(1):]
for c in cards:
    li=f'<li><a href="{c["href"]}"><b>{LBL[c["code"]]}</b>{e(c["vi"])}</a></li>'
    if f'href="{c["href"]}"><b>' not in s: s=s.replace('</ul></section>', li+'</ul></section>',1)
open(p,'w').write(s); print('cards',len(cards),'t402 linked',n)
