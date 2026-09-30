#!/usr/bin/env python3
import json, re, collections
from html.parser import HTMLParser
SRC="/home/ryan/Projects/cybertown/freewrl/archive-freewrl-site/browse/freewrl.sourceforge.io/conformance.html"
OUT="/tmp/fwsite/conformance.upstream.json"
ws=lambda s: re.sub(r'\s+',' ',s).strip()
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.h2=None; s.h2buf=None; s.comps=[]; s.cur=None; s.intable=False
        s.row=None; s.cell=None; s.bold=False; s.spec=None; s.inspec=False; s.specbuf=''
        s.attrs={}
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=='h2': s.h2buf=''
        if t=='a' and s.h2buf is not None: pass
        if t=='table':
            s.intable=True
            s.cur={"name":ws(s.h2 or ''),"level":None,"nodes":[],"_hdr":None}
            s.comps.append(s.cur)
        elif t=='tr' and s.intable: s.row=[]
        elif t=='td' and s.row is not None:
            s.cell={"text":'',"bold":False,"attrs":{k:v for k,v in a.items() if k in('bgcolor','style','class','colspan','rowspan')}}
        elif t in('b','strong') and s.cell is not None: s.cell["bold"]=True
        elif t=='font' and s.cell is not None and 'color' in a: s.cell["attrs"]["font_color"]=a['color']
    def handle_endtag(s,t):
        if t=='h2' and s.h2buf is not None:
            s.h2=ws(s.h2buf); s.h2buf=None
            if s.spec is None: pass
        elif t=='td' and s.cell is not None:
            s.cell["text"]=ws(s.cell["text"]); s.row.append(s.cell); s.cell=None
        elif t=='tr' and s.row is not None:
            r=s.row; s.row=None
            if not r: return
            if s.cur["_hdr"] is None:
                s.cur["_hdr"]=[c["text"] for c in r]; return
            n={"node":r[0]["text"],"status":r[1]["text"] if len(r)>1 else None,
               "notes":None}
            if len(r)>1 and r[1]["attrs"]: n["color"]=r[1]["attrs"]
            if len(r)>2: n["extra_cells"]=[c["text"] for c in r[2:]]
            if len(r)>1: n["status_bold"]=r[1]["bold"]
            s.cur["nodes"].append(n)
        elif t=='table': s.intable=False
    def handle_data(s,d):
        if s.h2buf is not None: s.h2buf+=d
        if s.cell is not None: s.cell["text"]+=d
html=open(SRC,encoding='utf-8',errors='replace').read()
fixed=html.replace('MicrophoneSource/td>','MicrophoneSource</td>')  # upstream malformed closing tag
p=P(); p.feed(fixed)
spec=ws(re.sub('<[^>]+>','',re.search(r'<H2><a name="X3D"[^>]*>(.*?)</a>',html,re.S|re.I).group(1)))
comps=[]
for c in p.comps:
    c.pop("_hdr"); comps.append(c)
    for n in c["nodes"]:
        if n["node"]=="MicrophoneSource": n["source_html_defect"]="upstream markup has '/td>' instead of '</td>' after the node name; repaired for parsing"
        if n["status"] in("Complete*","Extra*"): n["footnote_marker"]="*"

st=collections.Counter(n["status"] for c in comps for n in c["nodes"])
legend=[{"value":k,"meaning":None} for k in st]
json.dump({"source":{"page":"conformance.html","origin":"https://freewrl.sourceforge.io/conformance.html","captured":"2026-09-30","spec":spec,
 "notes":"Page states no legend; header columns are Node and Status only. Section heading may carry caveats (e.g. component 16 heading) - kept in component names."},
 "legend":legend,"components":comps},open(OUT,"w"),indent=2,ensure_ascii=False)
print(len(comps),sum(len(c["nodes"]) for c in comps),dict(st),spec)
print([c["name"] for c in comps if not c["nodes"]])
print([ (c["name"],n) for c in comps for n in c["nodes"] if "color" in n or "extra_cells" in n or n["status"] is None or not n.get("status_bold")][:15])
