#!/usr/bin/env python3
"""Holt Logos bzw. App-Icons der Start-ups von deren eigener Website und legt sie lokal ab.

Läuft in GitHub Actions (dort gibt es freien Internetzugang). Die Seite lädt die Logos dann
von GitHub Pages selbst – Besucher verbinden sich nie mit fremden Servern.

Quelle je Start-up: Feld "logo_url" (falls gesetzt), sonst die Startseite aus "website".
Ergebnis: assets/logos/<id>.png|.svg und assets/logos/index.json.
Aufruf: python3 tools/logos.py [--neu]   (--neu lädt auch vorhandene Logos erneut)
"""
import datetime as dt
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZIEL = ROOT / "assets" / "logos"
UA = "Mozilla/5.0 (compatible; startup-radar-logo/1.0; +https://github.com)"
try:
    from PIL import Image
except ImportError:  # ohne Pillow nur SVG
    Image = None


def hole(url, limit=600_000):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20) as r:
        typ = r.headers.get("Content-Type", "")
        daten = r.read(limit + 1)
        if len(daten) > limit:
            raise ValueError("zu groß")
        return daten, typ, r.geturl()


class Sammler(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.imgs, self.manifest = [], [], None

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "link":
            rel = a.get("rel", "").lower()
            if "manifest" in rel:
                self.manifest = a.get("href")
            elif "icon" in rel and "mask-icon" not in rel:
                self.links.append((rel, a.get("href", ""), a.get("sizes", ""), a.get("type", "")))
        elif tag == "img" and len(self.imgs) < 40:
            text = " ".join([a.get("src", ""), a.get("alt", ""), a.get("class", ""), a.get("id", "")]).lower()
            if "logo" in text and a.get("src") and not a.get("src", "").startswith("data:"):
                self.imgs.append(a.get("src"))


def groesse(s):
    m = re.search(r"(\d+)x(\d+)", s or "")
    return int(m.group(1)) if m else 0


def kandidaten(seite_url):
    html, typ, basis = hole(seite_url, 2_000_000)
    p = Sammler()
    p.feed(html.decode("utf-8", "ignore"))
    k = []
    for rel, href, sizes, typ in p.links:
        if not href:
            continue
        u = urllib.parse.urljoin(basis, href)
        if "apple-touch-icon" in rel:
            k.append((90 + min(groesse(sizes), 512) / 100, u, "icon"))
        elif href.lower().endswith(".svg") or "svg" in typ:
            k.append((85, u, "icon"))
        elif groesse(sizes) >= 96:
            k.append((80 + groesse(sizes) / 100, u, "icon"))
    if p.manifest:
        try:
            mu = urllib.parse.urljoin(basis, p.manifest)
            m = json.loads(hole(mu, 200_000)[0].decode("utf-8", "ignore"))
            for ic in m.get("icons", []):
                g = max([groesse(x) for x in (ic.get("sizes") or "").split()] or [0])
                if g >= 128:
                    k.append((82 + min(g, 512) / 100, urllib.parse.urljoin(mu, ic.get("src", "")), "icon"))
        except Exception:  # noqa: BLE001
            pass
    for i, src in enumerate(p.imgs[:4]):
        k.append((70 - i, urllib.parse.urljoin(basis, src), "logo"))
    domain = urllib.parse.urlparse(basis).netloc
    k.append((20, f"https://www.google.com/s2/favicons?domain={domain}&sz=128", "icon"))
    k.sort(key=lambda x: -x[0])
    return k


def saeubere_svg(text):
    text = re.sub(r"<script.*?</script>", "", text, flags=re.S | re.I)
    text = re.sub(r"\son\w+\s*=\s*(\"[^\"]*\"|'[^']*')", "", text, flags=re.I)
    text = re.sub(r"(xlink:)?href\s*=\s*(\"(?!#)[^\"]*\"|'(?!#)[^']*')", "", text, flags=re.I)
    return text


def speichere(id_, daten, typ, url, art):
    kopf = daten[:400].lstrip().lower()
    if "svg" in typ or kopf.startswith(b"<svg") or kopf.startswith(b"<?xml") and b"<svg" in daten[:2000].lower():
        text = saeubere_svg(daten.decode("utf-8", "ignore"))
        if "<svg" not in text.lower():
            return None
        (ZIEL / f"{id_}.svg").write_text(text, encoding="utf-8")
        return f"{id_}.svg"
    if Image is None:
        return None
    bild = Image.open(io.BytesIO(daten))
    bild.load()
    if hasattr(bild, "n_frames") and getattr(bild, "is_animated", False):
        bild.seek(0)
    if bild.format == "ICO":
        bild = max([bild.ico.getimage(s) for s in bild.ico.sizes()], key=lambda b: b.size[0])  # type: ignore[attr-defined]
    w, h = bild.size
    if art == "icon" and min(w, h) < 64:
        return None
    if art == "logo" and (w < 64 or h < 20):
        return None
    bild = bild.convert("RGBA")
    bild.thumbnail((256, 256))
    bild.save(ZIEL / f"{id_}.png", "PNG", optimize=True)
    return f"{id_}.png"


def main():
    neu = "--neu" in sys.argv
    ZIEL.mkdir(parents=True, exist_ok=True)
    startups = json.loads((ROOT / "data" / "startups.json").read_text(encoding="utf-8"))
    idx_pfad = ZIEL / "index.json"
    index = json.loads(idx_pfad.read_text(encoding="utf-8")) if idx_pfad.exists() else {}
    ids = {s["id"] for s in startups}
    for alt in [k for k in index if k not in ids]:
        for f in ZIEL.glob(f"{alt}.*"):
            if f.name != "index.json":
                f.unlink()
        del index[alt]
    heute = dt.date.today().isoformat()
    for s in startups:
        id_ = s["id"]
        if not neu and id_ in index and (ZIEL / index[id_]["datei"]).exists():
            continue
        quelle = s.get("logo_url") or s.get("website")
        if not quelle:
            print(f"{id_}: keine Website – übersprungen")
            continue
        try:
            liste = [(100, quelle, "logo")] if s.get("logo_url") else kandidaten(quelle)
        except Exception as ex:  # noqa: BLE001
            print(f"{id_}: Website nicht lesbar ({ex})")
            continue
        for _, url, art in liste:
            try:
                daten, typ, _ = hole(url)
                datei = speichere(id_, daten, typ, url, art)
            except Exception:  # noqa: BLE001
                continue
            if datei:
                for f in ZIEL.glob(f"{id_}.*"):
                    if f.name != datei:
                        f.unlink()
                index[id_] = {"datei": datei, "quelle": url, "art": art, "abgerufen": heute}
                print(f"{id_}: {datei} von {url}")
                break
        else:
            print(f"{id_}: kein brauchbares Logo gefunden")
    idx_pfad.write_text(json.dumps(index, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
