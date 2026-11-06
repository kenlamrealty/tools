#!/usr/bin/env python3
"""Ken Lam · Giải nghĩa form — video renderer.

Usage:
  python3 render.py LPD                 # reads ./LPD.json -> /home/claude/tools/t431/{guide.mp4,web.mp4,poster.jpg}
  python3 render.py --all               # every *.json here except names starting with "_"
  python3 render.py _SAMPLE --out DIR [--img-dir DIR]   # write outputs into DIR instead of tools/
  python3 render.py --all --json-dir D --out O            # test batch: O/<tcode>/...
  options: --no-web  --no-guide  --force-poster  --keep-tmp

How it works: each scene's static layer (paper, brand, kicker, text, sub, image card)
is drawn once as a PNG by Chromium (Playwright) so Vietnamese diacritics shape exactly
like the site (Be Vietnam Pro, local woff2 files in ./fonts). Python then composes every
frame (Ken Burns crop of the image into the card, crossfade, progress bar) and pipes raw
frames to ffmpeg, one encoded file per scene; scenes are joined with concat -c copy.
"""
import argparse, html, json, math, os, shutil, subprocess, sys, tempfile, time, unicodedata
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
JDIR = HERE
FONTS = HERE / "fonts"
TOOLS = Path("/home/claude/tools")
FPS = 30
XFADE = 0.4
PAPER = "#faf8f2"
INK = "#1d2327"
DEFAULT_COLOR = "#1f5a6b"
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p"]

# ---------------------------------------------------------------- helpers

def nfc(s):
    return unicodedata.normalize("NFC", s or "")

def esc(s):
    return html.escape(nfc(s))

def esc_breakable(s):
    """Escape, and let long tokens (URLs, phone numbers) wrap after / . - instead of overflowing."""
    out = []
    for w in nfc(s).split(" "):
        e = html.escape(w)
        if len(w) > 14:
            e = f'<span class=tok style="white-space:nowrap">{e}</span>'
        out.append(e)
    return " ".join(out)

def hex_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def font_css():
    out = []
    ranges = {
        "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
        "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
        "vietnamese": "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
    }
    for sub, rng in ranges.items():
        for w in (400, 500, 600, 700, 800):
            f = FONTS / f"be-vietnam-pro-{sub}-{w}-normal.woff2"
            if f.exists():
                out.append(f"@font-face{{font-family:'BVP';font-weight:{w};src:url('{f.as_uri()}') format('woff2');unicode-range:{rng};}}")
    if not out:
        sys.exit("Missing fonts in %s (npm pack @fontsource/be-vietnam-pro, copy files/*.woff2)" % FONTS)
    return "\n".join(out)

# ---------------------------------------------------------------- layouts
# Portrait 1080x1920: keep text out of top 160 and bottom 280 (Reels/TikTok UI).

def scene_html(sc, data, W, H, has_img, img_aspect, landscape):
    color = data.get("color") or DEFAULT_COLOR
    kicker, text, sub = esc(sc.get("kicker")), esc_breakable(sc.get("text")), esc_breakable(sc.get("sub"))
    brand = "Ken Lam · Giải nghĩa form"
    code = esc(data.get("code", ""))
    if not landscape:
        if has_img:
            ar = min(max(img_aspect, 0.72), 1.45)
            body = f"""
<div class=top><div class=k>{kicker}</div><div class=t id=t>{text}</div><div class=s>{sub}</div></div>
<div class=cardwrap id=cw><div class=card id=card style="aspect-ratio:{ar:.4f}"><div class=hole id=hole></div></div></div>"""
            tsize, ssize = 76, 44
        else:
            body = f"""<div class=mid><div class=k>{kicker}</div><div class=t id=t>{text}</div><div class=rule></div><div class=s>{sub}</div></div>"""
            tsize, ssize = 98, 48
        css = f"""
html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:{PAPER};}}
body{{font-family:'BVP',sans-serif;color:{INK};position:relative;
 background:radial-gradient(1200px 900px at 85% 0%, {color}14, transparent 60%),{PAPER};}}
.brand{{position:absolute;left:72px;right:72px;top:172px;display:flex;justify-content:space-between;align-items:center;
 font-weight:600;font-size:30px;letter-spacing:.02em;color:{color};}}
.brand .dot{{display:inline-block;width:16px;height:16px;border-radius:50%;background:{color};margin-right:14px;vertical-align:1px}}
.brand .code{{font-weight:700;font-size:26px;letter-spacing:.14em;border:2px solid {color};border-radius:999px;padding:6px 18px}}
.top{{position:absolute;left:72px;right:72px;top:262px;}}
.mid{{position:absolute;left:80px;right:80px;top:230px;bottom:330px;display:flex;flex-direction:column;justify-content:center;}}
.k{{font-weight:700;font-size:34px;letter-spacing:.14em;text-transform:uppercase;color:{color};margin-bottom:22px;}}
.t{{font-weight:800;font-size:{tsize}px;line-height:1.16;letter-spacing:-.01em;text-wrap:balance;}}
.s{{font-weight:500;font-size:{ssize}px;line-height:1.32;color:#4a5358;margin-top:22px;text-wrap:pretty;}}
.rule{{width:120px;height:8px;border-radius:4px;background:{color};margin-top:40px}}
.cardwrap{{position:absolute;left:60px;right:60px;bottom:330px;display:flex;align-items:center;justify-content:center;}}
.card{{background:#fff;border-radius:28px;padding:16px;box-shadow:0 18px 50px rgba(20,30,35,.18),0 2px 6px rgba(20,30,35,.10);
 border:2px solid {color}33;box-sizing:border-box;width:100%;max-height:100%;}}
.hole{{width:100%;height:100%;border-radius:16px;background:#fff;}}
"""
    else:  # landscape 1280x720 for the tool page loop
        if has_img:
            body = f"""<div class=col><div class=k>{kicker}</div><div class=t id=t>{text}</div><div class=s>{sub}</div></div>
<div class=cardwrap id=cw><div class=card id=card><div class=hole id=hole></div></div></div>"""
        else:
            body = f"""<div class=col style="right:80px"><div class=k>{kicker}</div><div class=t id=t style="font-size:64px">{text}</div><div class=s>{sub}</div></div>"""
        css = f"""
html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:{PAPER};}}
body{{font-family:'BVP',sans-serif;color:{INK};position:relative;
 background:radial-gradient(900px 600px at 100% 0%, {color}14, transparent 60%),{PAPER};}}
.brand{{position:absolute;left:56px;right:56px;top:36px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:20px;color:{color};}}
.brand .dot{{display:inline-block;width:11px;height:11px;border-radius:50%;background:{color};margin-right:10px}}
.brand .code{{font-weight:700;font-size:17px;letter-spacing:.14em;border:1.5px solid {color};border-radius:999px;padding:4px 12px}}
.col{{position:absolute;left:56px;right:660px;top:90px;bottom:70px;display:flex;flex-direction:column;justify-content:center;}}
.k{{font-weight:700;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:{color};margin-bottom:14px;}}
.t{{font-weight:800;font-size:48px;line-height:1.15;text-wrap:balance;}}
.s{{font-weight:500;font-size:26px;line-height:1.32;color:#4a5358;margin-top:14px;}}
.cardwrap{{position:absolute;left:660px;right:48px;top:92px;bottom:64px;display:flex;align-items:center;}}
.card{{background:#fff;border-radius:20px;padding:10px;box-shadow:0 12px 36px rgba(20,30,35,.18);border:1.5px solid {color}33;box-sizing:border-box;width:100%;height:100%;}}
.hole{{width:100%;height:100%;border-radius:12px;background:#fff;}}
"""
    return f"""<!doctype html><html><head><meta charset=utf-8><style>{font_css()}{css}</style></head>
<body><div class=brand><span><span class=dot></span>{esc(brand)}</span><span class=code>{code}</span></div>{body}</body></html>"""

FIT_JS = """(minT) => {
  const t = document.getElementById('t');
  // never let a word run past the column: shrink headline (not below minT), then sub
  const fitW = (el, min) => { if (!el) return; const fs0 = parseFloat(getComputedStyle(el).fontSize);
    const shrink = () => { let fs = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && fs > min) { fs -= 2; el.style.fontSize = fs + 'px'; } };
    shrink();
    if (el.scrollWidth > el.clientWidth + 1) {   // a URL-like token still too wide: let it break after / . -
      el.style.fontSize = fs0 + 'px';
      el.querySelectorAll('.tok').forEach(x => { x.style.whiteSpace = 'normal'; x.innerHTML = x.innerHTML.replace(/([\\/.\\-])/g, '$1<wbr>'); });
      shrink();
    } };
  fitW(t, minT); fitW(document.querySelector('.s'), 40);
  const cw = document.getElementById('cw');
  const card = document.getElementById('card');
  // portrait with image: shrink headline only if text block pushes the card below 520px
  if (t && cw && card && !document.body.dataset.land) {
    const top = t.parentElement;
    let fs = parseFloat(getComputedStyle(t).fontSize);
    const room = () => 1920 - 330 - (top.offsetTop + top.offsetHeight + 40);
    while (room() < 560 && fs > minT) { fs -= 2; t.style.fontSize = fs + 'px'; }
    const avail = room();
    cw.style.top = (1920 - 330 - avail) + 'px';
    card.style.maxHeight = avail + 'px';
    if (card.getBoundingClientRect().height > avail) { card.style.height = avail + 'px'; card.style.aspectRatio = 'auto'; }
  }
  const h = document.getElementById('hole');
  if (!h) return null;
  const r = h.getBoundingClientRect();
  return [r.left, r.top, r.width, r.height];
}"""

def draw_layers(page, data, scenes, W, H, landscape, tmp, img_for):
    out = []
    for i, sc in enumerate(scenes):
        im = img_for(sc)
        aspect = (im.width / im.height) if im else 1.0
        f = tmp / f"layer{i}.html"
        f.write_text(scene_html(sc, data, W, H, im is not None, aspect, landscape), encoding="utf-8")
        page.goto(f.as_uri())
        page.evaluate("document.fonts.ready")
        if landscape:
            page.evaluate("document.body.dataset.land='1'")
        hole = page.evaluate(FIT_JS, 64)
        png = tmp / f"layer{i}.png"
        page.screenshot(path=str(png))
        out.append((Image.open(png).convert("RGB"), hole if im else None, im))
    return out

# ---------------------------------------------------------------- Ken Burns

class KenBurns:
    def __init__(self, img, rect, focus, dur, radius):
        self.x, self.y = int(round(rect[0])), int(round(rect[1]))
        self.w, self.h = int(round(rect[2])), int(round(rect[3]))
        self.dur = max(dur, 0.1)
        iw, ih = img.size
        pa = self.w / self.h
        pad = max(iw, ih)
        self.pad = pad
        canvas = Image.new("RGB", (iw + 2 * pad, ih + 2 * pad), (255, 255, 255))
        canvas.paste(img, (pad, pad))
        self.src = canvas
        # start box: smallest panel-aspect box containing whole image (slight breathing room)
        bw, bh = (iw, iw / pa) if iw / ih >= pa else (ih * pa, ih)
        bw *= 1.02; bh *= 1.02
        self.b0 = (iw / 2, ih / 2, bw)
        fx, fy, fw, fh = focus if focus else (0.0, 0.0, 1.0, 1.0)
        fx, fy = fx * iw, fy * ih
        fw, fh = max(fw * iw, 1), max(fh * ih, 1)
        ew = max(fw, fh * pa) * 1.12
        ew = max(ew, bw / 2.6)          # cap zoom at 2.6x (keeps scan text sharp enough)
        ew = min(ew, bw)
        cx, cy = fx + fw / 2, fy + fh / 2
        eh = ew / pa
        # keep the end view inside the image where possible
        if ew <= iw: cx = min(max(cx, ew / 2), iw - ew / 2)
        else: cx = iw / 2
        if eh <= ih: cy = min(max(cy, eh / 2), ih - eh / 2)
        else: cy = ih / 2
        self.b1 = (cx, cy, ew)
        self.pa = pa
        self.focus_px = (fx, fy, fw, fh) if focus and fw * fh < 0.85 * iw * ih else None
        m = Image.new("L", (self.w * 2, self.h * 2), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, self.w * 2 - 1, self.h * 2 - 1], radius=radius * 2, fill=255)
        self.mask = m.resize((self.w, self.h), Image.LANCZOS)

    def box(self, t):
        # hold 0.3s, ease over the rest of the scene (and a bit past it for the outgoing crossfade)
        p = ease((t - 0.3) / max(self.dur - 0.5, 0.5))
        (x0, y0, w0), (x1, y1, w1) = self.b0, self.b1
        w = math.exp(math.log(w0) + (math.log(w1) - math.log(w0)) * p)
        # move centre proportional to zoom progress so the focus stays put visually
        q = (w0 - w) / (w0 - w1) if abs(w0 - w1) > 1e-6 else p
        cx, cy = x0 + (x1 - x0) * q, y0 + (y1 - y0) * q
        return cx, cy, w, w / self.pa, p

    def paste(self, frame, t, color):
        cx, cy, w, h, p = self.box(t)
        P = self.pad
        box = (cx - w / 2 + P, cy - h / 2 + P, cx + w / 2 + P, cy + h / 2 + P)
        view = self.src.resize((self.w, self.h), Image.BILINEAR, box=box, reducing_gap=2.0)
        if self.focus_px and p > 0.55:
            a = ease((p - 0.55) / 0.3)
            s = self.w / w
            fx, fy, fw, fh = self.focus_px
            L = (fx - (cx - w / 2)) * s; T = (fy - (cy - h / 2)) * s
            ov = Image.new("RGBA", view.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(ov)
            rgb = hex_rgb(color)
            d.rounded_rectangle([L - 10, T - 10, L + fw * s + 10, T + fh * s + 10], radius=14,
                                outline=rgb + (int(235 * a),), width=6)
            view = Image.alpha_composite(view.convert("RGBA"), ov).convert("RGB")
        frame.paste(view, (self.x, self.y), self.mask)

# ---------------------------------------------------------------- encoding

def encode_scene(path, frames_iter, W, H, crf):
    tmp = path.with_name(path.stem + ".part.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", *ENC, "-crf", str(crf), "-r", str(FPS),
           # keyframe right after the crossfade so static text never keeps ghosts of the old scene
           "-force_key_frames", f"0,{XFADE + 2 / FPS:.3f}", str(tmp)]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        for fr in frames_iter:
            pr.stdin.write(fr)
    finally:
        pr.stdin.close()
    if pr.wait() != 0:
        raise RuntimeError("ffmpeg failed on " + path.name)
    tmp.rename(path)

def concat(parts, out, tmp, total, audio=True):
    lst = tmp / ("list_%s.txt" % out.stem)
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    part = out.with_name(out.stem + ".part.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst)]
    if audio:  # silent AAC track: some uploaders (FB/IG) are happier with an audio stream
        cmd += ["-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "32k", "-shortest"]
    cmd += ["-c:v", "copy", "-movflags", "+faststart", str(part)]
    subprocess.run(cmd, check=True)
    part.rename(out)

# ---------------------------------------------------------------- render one video

def render_cut(page, data, scenes, W, H, landscape, out, tmp, img_for, crf, audio, bar=True):
    color = data.get("color") or DEFAULT_COLOR
    rgb = hex_rgb(color)
    layers = draw_layers(page, data, scenes, W, H, landscape, tmp, img_for)
    radius = 12 if landscape else 16
    kbs = []
    for (bg, hole, im), sc in zip(layers, scenes):
        kbs.append(KenBurns(im, hole, sc.get("focus"), float(sc["dur"]), radius) if im is not None and hole else None)
    durs = [float(s["dur"]) for s in scenes]
    total = sum(durs)
    starts = np.cumsum([0] + durs[:-1])
    if landscape:
        bx0, bx1, by, bh = 56, W - 48, H - 30, 5
    else:
        bx0, bx1, by, bh = 72, W - 72, 1920 - 300, 8
    track = tuple(int(c * 0.18 + p * 0.82) for c, p in zip(rgb, hex_rgb(PAPER)))

    def content(i, t):
        bg, _, _ = layers[i]
        fr = bg.copy()
        if kbs[i]:
            kbs[i].paste(fr, t, color)
        return fr

    parts = []
    nprev = 0
    for i, d in enumerate(durs):
        n_end = int(round((starts[i] + d) * FPS))
        n0 = nprev
        nprev = n_end
        static = kbs[i] is None

        def gen(i=i, n0=n0, n_end=n_end, static=static):
            cache = None
            for n in range(n0, n_end):
                tg = n / FPS
                t = tg - starts[i]
                if i > 0 and t < XFADE:
                    a = ease(t / XFADE)
                    A = np.asarray(content(i - 1, durs[i - 1] + t), dtype=np.float32)
                    B = np.asarray(content(i, t), dtype=np.float32)
                    fr = Image.fromarray((A * (1 - a) + B * a + 0.5).astype(np.uint8))
                elif static:
                    if cache is None:
                        cache = content(i, t)
                    fr = cache.copy()
                else:
                    fr = content(i, t)
                if bar:
                    dr = ImageDraw.Draw(fr)
                    dr.rounded_rectangle([bx0, by, bx1, by + bh], radius=bh // 2, fill=track)
                    xe = bx0 + (bx1 - bx0) * min((n + 1) / (total * FPS), 1.0)
                    dr.rounded_rectangle([bx0, by, max(xe, bx0 + bh), by + bh], radius=bh // 2, fill=rgb)
                yield fr.tobytes()

        p = tmp / f"{out.stem}_s{i:02d}.mp4"
        encode_scene(p, gen(), W, H, crf)
        parts.append(p)
    concat(parts, out, tmp, total, audio)
    return total

def load_json(name):
    p = Path(name)
    if not p.suffix:
        p = JDIR / f"{name}.json"
    elif not p.is_absolute():
        p = (Path.cwd() / p) if p.exists() else JDIR / p.name
    data = json.loads(p.read_text(encoding="utf-8"))
    return p, data

def render_form(name, args, page):
    jpath, data = load_json(name)
    tcode = (data.get("tcode") or "").lower()
    if not tcode and not args.out:
        raise SystemExit(f"{jpath.name}: no tcode and no --out")
    if args.out:
        outdir = Path(args.out) / tcode if (args.all and tcode) else Path(args.out)
    else:
        outdir = TOOLS / tcode
    outdir.mkdir(parents=True, exist_ok=True)
    scenes = data["scenes"]
    search = [Path(args.img_dir)] if args.img_dir else []
    search += [TOOLS / tcode, jpath.parent, outdir]
    cache = {}

    def img_for(sc):
        name = sc.get("img")
        if not name:
            return None
        if name in cache:
            return cache[name]
        for d in ([Path(name)] if Path(name).is_absolute() else [d / name for d in search]):
            if d.exists():
                im = Image.open(d).convert("RGB")
                cache[name] = im
                return im
        print(f"  ! {jpath.stem}: image {name} not found, scene rendered without it", file=sys.stderr)
        cache[name] = None
        return None

    total = sum(float(s["dur"]) for s in scenes)
    if not 40 <= total <= 50:
        print(f"  ! {jpath.stem}: total {total:.1f}s (brief asks ~45s)", file=sys.stderr)
    tmp = Path(tempfile.mkdtemp(prefix=f"vid_{jpath.stem}_", dir=args.tmp))
    t0 = time.time()
    res = {"form": jpath.stem, "out": str(outdir)}
    try:
        if not args.no_guide:
            page.set_viewport_size({"width": 1080, "height": 1920})
            g = outdir / "guide.mp4"
            render_cut(page, data, scenes, 1080, 1920, False, g, tmp, img_for, args.crf, True)
            res["guide"] = (g.stat().st_size, total)
            poster = outdir / "poster.jpg"
            if args.force_poster or not poster.exists():
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(g), "-frames:v", "1",
                                "-q:v", "3", str(poster)], check=True)
                res["poster"] = "written"
            else:
                res["poster"] = "kept existing"
        if not args.no_web:
            # landscape loop: hook scene + first two image scenes (or next scenes), ~8s total
            idx = [0] + [i for i, s in enumerate(scenes) if i and s.get("img") and img_for(s)][:2]
            for i in range(1, len(scenes) - 1):
                if len(idx) >= 3: break
                if i not in idx: idx.append(i)
            idx = sorted(idx)[:3]
            per = [2.2] + [2.9] * (len(idx) - 1)
            scale = 8.0 / sum(per)
            web_sc = [dict(scenes[i], dur=round(p * scale, 3)) for i, p in zip(idx, per)]
            page.set_viewport_size({"width": 1280, "height": 720})
            w = outdir / "web.mp4"
            render_cut(page, data, web_sc, 1280, 720, True, w, tmp, img_for, args.crf + 5, False)
            res["web"] = w.stat().st_size
    finally:
        if not args.keep_tmp:
            shutil.rmtree(tmp, ignore_errors=True)
    res["secs"] = round(time.time() - t0, 1)
    return res

def main():
    ap = argparse.ArgumentParser(description="Render guide.mp4 / web.mp4 / poster.jpg from video JSON")
    ap.add_argument("forms", nargs="*", help="form codes (LPD) or json paths")
    ap.add_argument("--all", action="store_true", help="render every *.json here except _*.json")
    ap.add_argument("--out", help="output dir (default /home/claude/tools/<tcode>)")
    ap.add_argument("--img-dir", help="extra dir to look for scene images first")
    ap.add_argument("--crf", type=int, default=23)
    ap.add_argument("--no-web", action="store_true")
    ap.add_argument("--no-guide", action="store_true")
    ap.add_argument("--force-poster", action="store_true", help="overwrite poster.jpg")
    ap.add_argument("--keep-tmp", action="store_true")
    ap.add_argument("--tmp", default=None, help="temp dir parent")
    ap.add_argument("--json-dir", default=str(HERE), help="where FORM.json files live (default: this dir)")
    args = ap.parse_args()
    global JDIR
    JDIR = Path(args.json_dir)
    forms = list(args.forms)
    if args.all:
        forms += [str(p) for p in sorted(JDIR.glob("*.json")) if not p.name.startswith("_")]
    if not forms:
        if args.all:
            print("no form json found in", JDIR); return
        ap.error("give a FORM or --all")
    from playwright.sync_api import sync_playwright
    fails = 0
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        page = br.new_page(viewport={"width": 1080, "height": 1920})
        for f in forms:
            try:
                r = render_form(f, args, page)
                msg = f"{r['form']}: {r['secs']}s"
                if "guide" in r: msg += f" | guide.mp4 {r['guide'][0]/1e6:.2f} MB {r['guide'][1]:.1f}s | poster {r['poster']}"
                if "web" in r: msg += f" | web.mp4 {r['web']/1e6:.2f} MB"
                print(msg + f" -> {r['out']}")
            except Exception as e:
                fails += 1
                print(f"{f}: FAILED {e}", file=sys.stderr)
        br.close()
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
