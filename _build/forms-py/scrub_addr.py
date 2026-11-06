"""Đổi địa chỉ thật trên PDF form thành 1234 Example Lane, San Jose, CA 95100.
Dùng: python3 scrub_addr.py IN.pdf OUT.pdf "555 Real St, San Jose, CA 95111" ["555 Real St"] ["95111"]
Chỉ dùng OUT.pdf để chụp hình (lớp chữ gốc vẫn nằm dưới ô trắng). Không đăng OUT.pdf."""
import sys, pymupdf as fitz
src, dst, *qs = sys.argv[1:]
def rep(q):
    if "," in q: return "1234 Example Lane, San Jose, CA 95100"
    if q.isdigit(): return "95100"
    return "1234 Example Lane"
d = fitz.open(src)
for pg in d:
    dd = pg.get_text("dict"); done = []
    for q in qs:
        for r in pg.search_for(q):
            if any(r.intersects(x) for x in done): continue
            s = None
            for b in dd["blocks"]:
                for l in b.get("lines", []):
                    for sp in l["spans"]:
                        if fitz.Rect(sp["bbox"]).intersects(r) and q[:4] in sp["text"]: s = sp
            fs = s["size"] if s else 8; c = s["color"] if s else 0x1f3f99; fn = s["font"] if s else ""
            h = r.height  # ô trắng thấp hơn dòng chữ để không ăn chữ dòng trên/dưới
            pg.draw_rect(fitz.Rect(r.x0-.5, r.y0+.18*h, r.x1+.5, r.y1-.12*h), color=None, fill=(1,1,1), overlay=True)
            b_, i_ = "Bold" in fn, ("Italic" in fn or "Oblique" in fn)
            pg.insert_text((r.x0, r.y1-.22*fs), rep(q), fontsize=fs, fontname="hebi" if b_ and i_ else "hebo" if b_ else "heit" if i_ else "helv",
                           color=(((c>>16)&255)/255, ((c>>8)&255)/255, (c&255)/255))
            done.append(r)
d.save(dst, garbage=3, deflate=True)
